"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable max-lines */
const fs_extra_1 = require("fs-extra");
const lodash_mergewith_1 = __importDefault(require("lodash.mergewith"));
const constants_1 = require("./constants");
const util_1 = require("./util");
const getHeaderName = (header) => {
    const matches = header.match(/^([^:]+):/);
    return matches && matches[1];
};
const validHeaders = (headers, reporter) => {
    if (!headers || typeof headers !== 'object') {
        return false;
    }
    return Object.entries(headers).every(([path, headersList]) => Array.isArray(headersList) &&
        headersList.every((header) => {
            if (typeof header === 'string' && !getHeaderName(header)) {
                reporter.panic(`[gatsby-plugin-netlify] ${path} contains an invalid header (${header}). Please check your plugin configuration`);
            }
            return true;
        }));
};
const headersPath = (pathPrefix, path) => `${pathPrefix}${path}`;
const unionMerge = (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
        return [...new Set([...objValue, ...srcValue])];
    }
    // opt into default merge behavior
};
const defaultMerge = (...headers) => (0, lodash_mergewith_1.default)({}, ...headers, unionMerge);
const headersMerge = (userHeaders, defaultHeaders) => {
    const merged = {};
    Object.keys(defaultHeaders).forEach((path) => {
        if (!userHeaders[path]) {
            merged[path] = defaultHeaders[path];
            return;
        }
        const headersMap = {};
        defaultHeaders[path].forEach((header) => {
            headersMap[getHeaderName(header)] = header;
        });
        userHeaders[path].forEach((header) => {
            // override if exists
            headersMap[getHeaderName(header)] = header;
        });
        merged[path] = Object.values(headersMap);
    });
    Object.keys(userHeaders).forEach((path) => {
        if (!merged[path]) {
            merged[path] = userHeaders[path];
        }
    });
    return merged;
};
const transformLink = (manifest, publicFolder, pathPrefix) => (header) => header.replace(constants_1.LINK_REGEX, (__, prefix, file, suffix) => {
    const hashed = manifest[file];
    if (hashed) {
        return `${prefix}${pathPrefix}${hashed}${suffix}`;
    }
    if ((0, fs_extra_1.existsSync)(publicFolder(file))) {
        return `${prefix}${pathPrefix}${file}${suffix}`;
    }
    throw new Error(`Could not find the file specified in the Link header \`${header}\`.` +
        `The gatsby-plugin-netlify is looking for a matching file (with or without a ` +
        `webpack hash). Check the public folder and your gatsby-config.js to ensure you are ` +
        `pointing to a public file.`);
});
// Writes out headers file format, with two spaces for indentation
// https://www.netlify.com/docs/headers-and-basic-auth/
const stringifyHeaders = (headers) => Object.entries(headers).reduce((text, [path, headerList]) => {
    const headersString = headerList.reduce((accum, header) => `${accum}  ${header}\n`, ``);
    return `${text}${path}\n${headersString}`;
}, ``);
// program methods
const validateUserOptions = (pluginOptions, reporter) => (headers) => {
    if (!validHeaders(headers, reporter)) {
        throw new Error(`The "headers" option to gatsby-plugin-netlify is in the wrong shape. ` +
            `You should pass in a object with string keys (representing the paths) and an array ` +
            `of strings as the value (representing the headers). ` +
            `Check your gatsby-config.js.`);
    }
    [`mergeSecurityHeaders`, `mergeCachingHeaders`].forEach((mergeOption) => {
        if (!(0, util_1.isBoolean)(pluginOptions[mergeOption])) {
            throw new TypeError(`The "${mergeOption}" option to gatsby-plugin-netlify must be a boolean. Check your gatsby-config.js.`);
        }
    });
    if (typeof pluginOptions.transformHeaders !== 'function') {
        throw new TypeError(`The "transformHeaders" option to gatsby-plugin-netlify must be a function ` +
            `that returns an array of header strings. ` +
            `Check your gatsby-config.js.`);
    }
    return headers;
};
const mapUserLinkHeaders = ({ manifest, pathPrefix, publicFolder }) => (headers) => Object.fromEntries(Object.entries(headers).map(([path, headerList]) => [
    path,
    headerList.map(transformLink(manifest, publicFolder, pathPrefix)),
]));
const mapUserLinkAllPageHeaders = (pluginData, { allPageHeaders }) => (headers) => {
    if (!allPageHeaders) {
        return headers;
    }
    const { pages, manifest, publicFolder, pathPrefix } = pluginData;
    const headersList = allPageHeaders.map(transformLink(manifest, publicFolder, pathPrefix));
    const duplicateHeadersByPage = {};
    pages.forEach((page) => {
        const pathKey = headersPath(pathPrefix, page.path);
        duplicateHeadersByPage[pathKey] = headersList;
    });
    return defaultMerge(headers, duplicateHeadersByPage);
};
const applySecurityHeaders = ({ mergeSecurityHeaders }) => (headers) => {
    if (!mergeSecurityHeaders) {
        return headers;
    }
    return headersMerge(headers, constants_1.SECURITY_HEADERS);
};
const applyCachingHeaders = (pluginData, { mergeCachingHeaders }) => (headers) => {
    if (!mergeCachingHeaders) {
        return headers;
    }
    const files = new Set();
    for (const fileNameOrArrayOfFileNames of Object.values(pluginData.manifest)) {
        if (Array.isArray(fileNameOrArrayOfFileNames)) {
            for (const filename of fileNameOrArrayOfFileNames) {
                files.add(filename);
            }
        }
        else if (typeof fileNameOrArrayOfFileNames === `string`) {
            files.add(fileNameOrArrayOfFileNames);
        }
    }
    const cachingHeaders = {};
    files.forEach((file) => {
        if (typeof file === `string`) {
            cachingHeaders[`/${file}`] = [constants_1.IMMUTABLE_CACHING_HEADER];
        }
    });
    return defaultMerge(headers, cachingHeaders, constants_1.CACHING_HEADERS);
};
const applyTransformHeaders = ({ transformHeaders }) => (headers) => Object.entries(headers).reduce((temp, [key, value]) => {
    temp[key] = transformHeaders(value);
    return temp;
}, {});
const transformToString = (headers) => `${constants_1.HEADER_COMMENT}\n\n${stringifyHeaders(headers)}`;
const writeHeadersFile = ({ publicFolder }) => (contents) => (0, fs_extra_1.writeFile)(publicFolder(constants_1.NETLIFY_HEADERS_FILENAME), contents);
const buildHeadersProgram = (pluginData, pluginOptions, reporter) => (0, util_1.flow)([
    validateUserOptions(pluginOptions, reporter),
    mapUserLinkHeaders(pluginData),
    applySecurityHeaders(pluginOptions),
    applyCachingHeaders(pluginData, pluginOptions),
    mapUserLinkAllPageHeaders(pluginData, pluginOptions),
    applyTransformHeaders(pluginOptions),
    transformToString,
    writeHeadersFile(pluginData),
])(pluginOptions.headers);
exports.default = buildHeadersProgram;
/* eslint-enable max-lines */
