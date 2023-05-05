// https://www.netlify.com/docs/headers-and-basic-auth/
import { join } from "path";

import { writeJson, remove, readJSON } from "fs-extra";
import { generatePageDataPath } from "gatsby-core-utils";
import WebpackAssetsManifest from "webpack-assets-manifest";
import { bindOpts as cacheBindOpts } from "@netlify/cache-utils";

import buildHeadersProgram from "./build-headers-program";
import {
  DEFAULT_OPTIONS,
  BUILD_BROWSER_BUNDLE_STAGE,
  PAGE_COUNT_WARN,
} from "./constants";
import createRedirects from "./create-redirects";
import makePluginData from "./plugin-data";
import { handleFunctions } from "./glue";

const CACHE_DIR = `.netlify/cache`;

async function getCacheUtils() {
  return (await import("@netlify/cache-utils")).bindOpts({
    cacheDir: CACHE_DIR,
  });
}

// const cacheUtils = cacheBindOpts({ cacheDir: CACHE_DIR });

const assetsManifest = {};
/** @type {import("gatsby").GatsbyNode["pluginOptionsSchema"]} */
export const pluginOptionsSchema = ({ Joi }: any) => {
  const MATCH_ALL_KEYS = /^/;

  // headers is a specific type used by Netlify: https://www.gatsbyjs.com/plugins/gatsby-plugin-netlify/#headers
  const headersSchema = Joi.object()
    .pattern(MATCH_ALL_KEYS, Joi.array().items(Joi.string()))
    .description(`Add more Netlify headers to specific pages`);

  return Joi.object({
    headers: headersSchema,
    allPageHeaders: Joi.array()
      .items(Joi.string())
      .description(`Add more headers to all the pages`),
    mergeSecurityHeaders: Joi.boolean().description(
      `When set to false, turns off the default security headers`
    ),
    mergeLinkHeaders: Joi.boolean()
      .description(`When set to false, turns off the default gatsby js headers`)
      .forbidden()
      .messages({
        "any.unknown": `"mergeLinkHeaders" is no longer supported. Gatsby no longer adds preload headers as they negatively affect load performance`,
      }),
    mergeCachingHeaders: Joi.boolean().description(
      `When set to false, turns off the default caching headers`
    ),
    transformHeaders: Joi.function()
      .maxArity(2)
      .description(
        `Transform function for manipulating headers under each path (e.g.sorting), etc. This should return an object of type: { key: Array<string> }`
      ),
    generateMatchPathRewrites: Joi.boolean().description(
      `When set to false, turns off automatic creation of redirect rules for client only paths`
    ),
  });
};

// Inject a webpack plugin to get the file manifests so we can translate all link headers
/** @type {import("gatsby").GatsbyNode["onCreateWebpackConfig"]} */
export const onPreInit = async ({ store }) => {
  const { program } = store.getState();

  await (
    await getCacheUtils()
  ).restore([
    join(program.directory, `.cache`),
    join(program.directory, `public`),
  ]);

  try {
    const content = await readJSON(
      join(program.directory, `.cache`, `test.json`)
    );
    console.log(`afterRestore success`, content);
  } catch (e) {
    console.log(`afterRestore fail`, e);
  }
};

export const onCreateWebpackConfig = ({ actions, stage }: any) => {
  // We only need to get manifest for production browser bundle
  if (stage !== BUILD_BROWSER_BUNDLE_STAGE) {
    return;
  }
  actions.setWebpackConfig({
    plugins: [
      new WebpackAssetsManifest({
        // mutates object with entries
        assets: assetsManifest,
        merge: true,
      }),
    ],
  });
};

/** @type {import("gatsby").GatsbyNode["onPostBuild"]} */
export const onPostBuild = async (
  { store, pathPrefix, reporter }: any,
  userPluginOptions: any
) => {
  const pluginData = makePluginData(store, assetsManifest, pathPrefix);
  const pluginOptions = { ...DEFAULT_OPTIONS, ...userPluginOptions };

  const { redirects, pages, functions = [], program } = store.getState();
  if (pages.size > PAGE_COUNT_WARN && pluginOptions.mergeCachingHeaders) {
    reporter.warn(
      `[gatsby-plugin-netlify] Your site has ${pages.size} pages, which means that the generated headers file could become very large. Consider disabling "mergeCachingHeaders" in your plugin config`
    );
  }
  reporter.info(`[gatsby-plugin-netlify] Creating SSR/DSG redirects...`);

  let count = 0;
  const rewrites: any = [];

  const neededFunctions = {
    API: functions.length !== 0,
    SSR: false,
    DSG: false,
  };

  [...pages.values()].forEach((page) => {
    const { mode, matchPath, path } = page;
    const matchPathClean = matchPath && matchPath.replace(/\*.*/, "*");
    const matchPathIsNotPath = matchPath && matchPath !== path;

    if (mode === `SSR` || mode === `DSG`) {
      neededFunctions[mode] = true;
      const fromPath = matchPathClean ?? path;
      const toPath =
        mode === `SSR`
          ? `/.netlify/functions/__ssr`
          : `/.netlify/functions/__dsg`;
      count++;
      rewrites.push(
        {
          fromPath,
          toPath,
        },
        {
          fromPath: generatePageDataPath(`/`, fromPath),
          toPath,
        }
      );
    } else if (pluginOptions.generateMatchPathRewrites && matchPathIsNotPath) {
      rewrites.push({
        fromPath: matchPathClean,
        toPath: path,
      });
    }
  });
  reporter.info(
    `[gatsby-plugin-netlify] Created ${count} SSR/DSG redirect${
      count === 1 ? `` : `s`
    }...`
  );

  // const skipFilePath = join(program.directory, `.cache`, `.nf-skip-gatsby-functions`)
  // const generateSkipFile = Object.values(neededFunctions).includes(false)
  //   ? writeJson(skipFilePath, neededFunctions)
  //   : remove(skipFilePath)

  await writeJson(join(program.directory, `.cache`, `test.json`), {
    foo: "bar",
  });

  await Promise.all([
    // generateSkipFile,
    handleFunctions(neededFunctions),
    buildHeadersProgram(pluginData, pluginOptions, reporter),
    createRedirects(pluginData, redirects, rewrites),
    (
      await getCacheUtils()
    ).save([
      join(program.directory, `.cache`),
      join(program.directory, `public`),
    ]),
  ]);
};
