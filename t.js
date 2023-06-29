// const run = async () => {
//   const test = await import("./import.js");

//   console.log({ test, s: test.default, s2: test.default.default });
// };

// run();

const { satisfies } = require("semver");

console.log(
  satisfies("1.0.0-alpha-adapters.21545", "^1.0.0", {
    includePrerelease: true,
  })
);
