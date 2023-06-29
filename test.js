// const express = require("express");
// const app = express();
// const port = 3000;

// const lambda = require(`./.cache/page-ssr/lambda`).default;

// app.use(express.static("public"));
// app.use(lambda);

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

// const fs = require(`fs`);

// fs.accessSync(__filename, fs.constants.W_OK);
// process.versions.modules = 5;
// process.versions = { modules: 5 };
// console.log(process.versions.modules);
// const vm = require(`vm`);

// const fs = require(`fs-extra`);
// fs.test = 1;

// console.log({ testReg: require(`fs-extra`).test });

// console.log({ testReg2: require(`fs-extra#1`).test });

// vm.runInNewContext("console.log({ testVm: require(`fs-extra`).test });", {});

const path = require(`path`);

const absPath = `/Users/misiek/test/no-build-plugin-gatsby/node_modules/cookie/index.js`;
const functionFile = `/Users/misiek/test/no-build-plugin-gatsby/.netlify/functions-internal/ssr-engine/ssr-engine.js`;

console.log(`./` + path.relative(functionFile, absPath));
