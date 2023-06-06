"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFunctions = void 0;
const functions_1 = require("./helpers/functions");
const config_1 = require("./helpers/config");
const files_1 = require("./helpers/files");
async function handleFunctions(neededFunctionsObj) {
    const PUBLISH_DIR = "public";
    const cacheDir = ".cache";
    const constants = {
        PUBLISH_DIR,
        INTERNAL_FUNCTIONS_SRC: ".netlify/functions-internal",
    };
    const netlifyConfig = {
        build: {
            environment: {},
            publish: PUBLISH_DIR,
        },
        functions: {},
    };
    const neededFunctions = Object.keys(neededFunctionsObj).filter((name) => neededFunctionsObj[name] === true);
    // console.log(`1`);
    await (0, functions_1.deleteFunctions)(constants);
    // console.log(`2`);
    // TO-DO:
    // if (shouldSkipBundlingDatastore()) {
    //   console.log("Creating site data metadata file");
    //   await createMetadataFileAndCopyDatastore(PUBLISH_DIR, cacheDir);
    // }
    await (0, functions_1.writeFunctions)({ constants, netlifyConfig, neededFunctions });
    // console.log(`3`);
    await (0, config_1.modifyConfig)({ netlifyConfig, cacheDir, neededFunctions, constants });
    // console.log(`4`);
    await (0, files_1.modifyFiles)({ netlifyConfig, neededFunctions });
    // console.log(`5`);
}
exports.handleFunctions = handleFunctions;
