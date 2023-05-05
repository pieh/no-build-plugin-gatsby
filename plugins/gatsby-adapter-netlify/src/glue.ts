import type { NetlifyConfig, NetlifyPluginConstants } from "@netlify/build";

import {
  deleteFunctions,
  writeFunctions,
  FunctionList,
} from "./helpers/functions";
import {
  // createMetadataFileAndCopyDatastore,
  // checkConfig,
  // getNeededFunctions,
  modifyConfig,
  // shouldSkipBundlingDatastore,
} from "./helpers/config";
import { modifyFiles } from "./helpers/files";

type NeededFunctionsObj = {
  API: boolean;
  SSR: boolean;
  DSG: boolean;
};

export async function handleFunctions(
  neededFunctionsObj: NeededFunctionsObj
): Promise<void> {
  const PUBLISH_DIR = "public";
  const cacheDir = "/Users/misiek/test/no-build-plugin-gatsby/.cache";

  const constants = {
    PUBLISH_DIR,
    INTERNAL_FUNCTIONS_SRC: ".netlify/functions-internal",
  } as NetlifyPluginConstants;

  const netlifyConfig = {
    build: {
      environment: {},
      publish: PUBLISH_DIR,
    },
    functions: {},
  } as NetlifyConfig;

  const neededFunctions = Object.keys(neededFunctionsObj).filter(
    (name) => neededFunctionsObj[name] === true
  ) as FunctionList;

  // console.log(`1`);
  await deleteFunctions(constants);
  // console.log(`2`);
  // TO-DO:
  // if (shouldSkipBundlingDatastore()) {
  //   console.log("Creating site data metadata file");
  //   await createMetadataFileAndCopyDatastore(PUBLISH_DIR, cacheDir);
  // }

  await writeFunctions({ constants, netlifyConfig, neededFunctions });

  // console.log(`3`);
  await modifyConfig({ netlifyConfig, cacheDir, neededFunctions, constants });
  // console.log(`4`);
  await modifyFiles({ netlifyConfig, neededFunctions });
  // console.log(`5`);
}
