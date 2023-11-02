/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

// const { createSomeAdapter } = require("some-adapter");
/**
 * @type {import('gatsby').GatsbyConfig}
 */

// const adapter = require(`gatsby-adapter-netlify`).default;

// console.log(`AWS_LAMBDA_JS_RUNTIME`, {
//   AWS_LAMBDA_JS_RUNTIME: process.env.AWS_LAMBDA_JS_RUNTIME,
// });

module.exports = {
  siteMetadata: {
    title: `hello`,
    description: `world`,
  },
  plugins: [
    // `gatsby-plugin-netlify-all-in-one`
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/images`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-secrets-test`,
      options: {
        secret: process.env.FRA_90_MY_SECRET,
      },
    },
    // `gatsby-plugin-netlify`,
  ],
  // deploy: {
  //   shouldUploadLMDBtoCDN: true,
  // },
  // adapter: adapter({ excludeDatastoreFromEngineFunction: true }),
  // pathPrefix: `/test`,
  // assetPrefix: `https://cdn.example.com/test`,

  // adapter: createSomeAdapter({
  //   lmdbOnCDN: false
  // })

  // trailingSlash: true,
  // trailingSlash: "never",
  headers: [
    {
      source: `/*`,
      headers: [
        {
          key: "x-custom-header",
          value: "my custom header value",
        },
      ],
    },
    {
      source: `/ssr/*`,
      headers: [
        {
          key: "x-ssr-header",
          value: "my custom header value from config",
        },
        {
          key: "x-ssr-header-overwrite",
          value: "my custom header value from config",
        },
      ],
    },
    {
      source: `/dsg/*`,
      headers: [
        {
          key: "x-dsg-header",
          value: "my custom header value",
        },
      ],
    },
  ],
};
