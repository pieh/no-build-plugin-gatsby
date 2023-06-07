// const express = require("express");
// const app = express();
// const port = 3000;

// const lambda = require(`./.cache/page-ssr/lambda`).default;

// app.use(express.static("public"));
// app.use(lambda);

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

const fs = require(`fs`);

fs.accessSync(__filename, fs.constants.X_OK);
