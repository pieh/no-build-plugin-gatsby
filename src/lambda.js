"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var path = _interopRequireWildcard(require("path"));
var fs = _interopRequireWildcard(require("fs-extra"));
var _os = require("os");
var _linkfs = require("linkfs");
var _directoryTree = _interopRequireDefault(require("directory-tree"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// @ts-ignore added by test site

function setupFsWrapper() {
  // setup global._fsWrapper
  try {
    throw new Error(`wat - forcing read-only`);
    fs.accessSync(__filename, fs.constants.W_OK);
    console.log(`have write access`);
  } catch (e) {
    console.error(`no write access`, e);
    const TEMP_CACHE_DIR = path.join((0, _os.tmpdir)(), `gatsby`, `.cache`);

    // TODO: don't hardcode this
    // const cacheDir = process.env.NETLIFY
    //   ? `/var/task/.cache`
    //   : `/Users/misiek/test/no-build-plugin-gatsby/.cache`
    const cacheDir = `/var/task/.cache`;
    // we need to rewrite fs

    try {
      console.log(`from1`, require(`util`).inspect((0, _directoryTree.default)(cacheDir), {
        depth: Infinity,
        colors: true
      }));
      console.log(`to1`, require(`util`).inspect((0, _directoryTree.default)(TEMP_CACHE_DIR), {
        depth: Infinity,
        colors: true
      }));
    } catch (e) {
      console.error(`error1`, e);
    }
    const rewrites = [[path.join(cacheDir, `caches`), path.join(TEMP_CACHE_DIR, `caches`)], [path.join(cacheDir, `caches-lmdb`), path.join(TEMP_CACHE_DIR, `caches-lmdb`)], [path.join(cacheDir, `data`), path.join(TEMP_CACHE_DIR, `data`)]];
    console.log(`Preparing Gatsby filesystem`, {
      from: cacheDir,
      to: TEMP_CACHE_DIR,
      rewrites
    });
    // Alias the cache dir paths to the temp dir
    const lfs = (0, _linkfs.link)(fs, rewrites);

    // linkfs doesn't pass across the `native` prop, which graceful-fs needs
    for (const key in lfs) {
      if (Object.hasOwnProperty.call(fs[key], `native`)) {
        lfs[key].native = fs[key].native;
      }
    }

    // 'promises' is not initially linked within the 'linkfs'
    // package, and is needed by underlying Gatsby code (the
    // @graphql-tools/code-file-loader)
    lfs.promises = (0, _linkfs.link)(fs.promises, rewrites);
    const dir = `data`;
    if (!process.env.NETLIFY_LOCAL && fs.existsSync(path.join(TEMP_CACHE_DIR, dir))) {
      console.log(`directory already exists`);
      return;
    }
    console.log(`Start copying ${dir}`);
    fs.copySync(path.join(cacheDir, dir), path.join(TEMP_CACHE_DIR, dir));
    console.log(`End copying ${dir}`);
    const orig = lfs.mkdirSync;
    lfs.mkdirSync = (...args) => {
      console.log(`mkdirSync stuff`, args);
      return orig.apply(lfs, args);
    };
    try {
      console.log(`from2`, require(`util`).inspect((0, _directoryTree.default)(cacheDir), {
        depth: Infinity,
        colors: true
      }));
      console.log(`to2`, require(`util`).inspect((0, _directoryTree.default)(TEMP_CACHE_DIR), {
        depth: Infinity,
        colors: true
      }));
    } catch (e) {
      console.error(`error2`, e);
    }

    // Gatsby uses this instead of fs if present
    // eslint-disable-next-line no-underscore-dangle
    global._fsWrapper = lfs;
  }
}
setupFsWrapper();

// using require instead of import here for now because of type hell + import path doesn't exist in current context
// as this file will be copied elsewhere

const {
  GraphQLEngine
} = require(`../query-engine`);
const {
  getData,
  renderPageData,
  renderHTML
} = require(`./index`);
const graphqlEngine = new GraphQLEngine({
  dbPath: path.join(__dirname, `..`, `data`, `datastore`)
});
function reverseFixedPagePath(pageDataRequestPath) {
  return pageDataRequestPath === `index` ? `/` : pageDataRequestPath;
}
function getPathInfo(req) {
  // @ts-ignore GatsbyFunctionRequest.path is not in types ... there is no property in types that can be used to get a path currently
  const matches = req.url.matchAll(/^\/?page-data\/(.+)\/page-data.json$/gm);
  for (const [, requestedPagePath] of matches) {
    return {
      isPageData: true,
      pagePath: reverseFixedPagePath(requestedPagePath)
    };
  }

  // if not matched
  return {
    isPageData: false,
    // @ts-ignore GatsbyFunctionRequest.path is not in types ... there is no property in types that can be used to get a path currently
    pagePath: req.url
  };
}
function setStatusAndHeaders({
  page,
  data,
  res
}) {
  if (page.mode === `SSR`) {
    if (data.serverDataStatus) {
      res.status(data.serverDataStatus);
    }
    if (data.serverDataHeaders) {
      for (const [name, value] of Object.entries(data.serverDataHeaders)) {
        res.setHeader(name, value);
      }
    }
  }
}
async function engineHandler(req, res) {
  try {
    const pathInfo = getPathInfo(req);
    if (!pathInfo) {
      res.status(404).send(`Not found`);
      return;
    }
    const {
      isPageData,
      pagePath
    } = pathInfo;
    const page = graphqlEngine.findPageByPath(pagePath);
    if (!page) {
      res.status(404).send(`Not found`);
      return;
    }
    const data = await getData({
      pathName: pagePath,
      graphqlEngine,
      req
    });
    if (isPageData) {
      const results = await renderPageData({
        data
      });
      setStatusAndHeaders({
        page,
        data,
        res
      });
      res.json(results);
      return;
    } else {
      const results = await renderHTML({
        data
      });
      setStatusAndHeaders({
        page,
        data,
        res
      });
      res.send(results);
      return;
    }
  } catch (e) {
    console.error(`Engine failed to handle request`, e);
    res.status(500).send(`Internal server error.`);
  }
}
var _default = engineHandler;
exports.default = _default;
//# sourceMappingURL=lambda.js.map