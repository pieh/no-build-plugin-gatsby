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

module.exports = {
  plugins: [
    // `gatsby-plugin-netlify-all-in-one`
  ],

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
