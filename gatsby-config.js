/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

// const { createSomeAdapter } = require("some-adapter");
/**
 * @type {import('gatsby').GatsbyConfig}
 */

process.env.GATSBY_FORCE_LMDB_BINARY_LOCATION = `../../@lmdb/lmdb-${process.platform}-${process.arch}/node.abi83.glibc.node`;

console.log(`AWS_LAMBDA_JS_RUNTIME`, {
  AWS_LAMBDA_JS_RUNTIME: process.env.AWS_LAMBDA_JS_RUNTIME,
});

module.exports = {
  plugins: [
    // `gatsby-plugin-netlify-all-in-one`
  ],
  pathPrefix: `/test`,
  assetPrefix: `https://cdn.example.com/test`,

  // adapter: createSomeAdapter({
  //   lmdbOnCDN: false
  // })

  // trailingSlash: true,
  // headers: [
  //   {
  //     source: `/*`,
  //     mergeCacheHeaders: false,
  //     headers: [
  //       "Basic-Auth: someuser:somepassword anotheruser:anotherpassword",
  //       {
  //         key: "x-custom-header",
  //         value: "my custom header value",
  //       },
  //     ],
  //   },
  // ],
};
