// https://www.netlify.com/docs/headers-and-basic-auth/
import { join } from "path";

import { writeJson, remove, readJSON } from "fs-extra";
import { generatePageDataPath } from "gatsby-core-utils";
import WebpackAssetsManifest from "webpack-assets-manifest";

import buildHeadersProgram from "./build-headers-program";
import {
  DEFAULT_OPTIONS,
  BUILD_BROWSER_BUNDLE_STAGE,
  PAGE_COUNT_WARN,
} from "./constants";
import createRedirects from "./create-redirects";
import makePluginData from "./plugin-data";
import { handleFunctions } from "./glue";
// import { bindOpts } from "@netlify/cache-utils";
const CACHE_DIR = process.env.NETLIFY ? `/opt/build/cache` : `.netlify/cache`;

// bindOpts();
async function getCacheUtils() {
  return (await import("@netlify/cache-utils")).bindOpts({
    cacheDir: CACHE_DIR,
  });
}

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

/** @type {import("gatsby").GatsbyNode["onPreInit"]} */
export const onPreInit = async ({ store }) => {
  console.log(`process.env.CI="${process.env.CI}"`);
  const state = store.getState();
  // global.startBreakPoint = true;

  await (
    await getCacheUtils()
  ).restore([
    join(state.program.directory, `.cache`),
    join(state.program.directory, `public`),
  ]);

  // hacks ... (just kidding - hacks started long ago, but this is especially hacky)
  // const { readState } = require(`gatsby/dist/redux`);

  // const cachedState = readState();

  // if (Object.keys(cachedState).length > 0) {
  //   console.log(
  //     "restoring state",
  //     require(`util`).inspect(
  //       { mem: state.html, cached: cachedState.html },
  //       { depth: Infinity, colors: true }
  //     )
  //   );

  //   console.log(
  //     "restored state 1",
  //     require(`util`).inspect(store.getState().html, {
  //       depth: Infinity,
  //       colors: true,
  //     })
  //   );
  //   store.dispatch({ type: `RESTORE_CACHE`, payload: cachedState });

  //   console.log(
  //     "restored state 2",
  //     require(`util`).inspect(store.getState().html, {
  //       depth: Infinity,
  //       colors: true,
  //     })
  //   );
  // } else {
  //   console.log("no state to restore");
  // }
  // global.startBreakPoint = false;
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
  // require(`fs-extra`).outputJSONSync();

  writeJson(`./manifest.json`, assetsManifest);

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

  console.log(`[NETLIFY] save stuff`);
  // console.log(`[NETLIFY] status`, store.getState().status);
  // import * as db from "../redux/save-state";
  const { saveState } = require(`gatsby/dist/redux/save-state`);

  console.time(`extra save start`);
  await saveState();
  console.timeEnd(`extra save start`);

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
