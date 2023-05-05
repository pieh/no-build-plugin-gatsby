const t = {
  __api: {
    included_files: [
      "/Users/misiek/test/with-build-plugin-gatsby-baseline/.cache/functions/**",
    ],
    external_node_modules: ["msgpackr-extract"],
  },
  __dsg: {
    included_files: [
      "public/404.html",
      "public/500.html",
      "/Users/misiek/test/with-build-plugin-gatsby-baseline/.cache/query-engine/**",
      "/Users/misiek/test/with-build-plugin-gatsby-baseline/.cache/page-ssr/**",
      "!**/*.js.map",
      "/Users/misiek/test/with-build-plugin-gatsby-baseline/.cache/data/**",
    ],
    external_node_modules: ["msgpackr-extract"],
    node_bundler: "esbuild",
  },
  __ssr: {
    included_files: [
      "public/404.html",
      "public/500.html",
      "/Users/misiek/test/with-build-plugin-gatsby-baseline/.cache/query-engine/**",
      "/Users/misiek/test/with-build-plugin-gatsby-baseline/.cache/page-ssr/**",
      "!**/*.js.map",
      "/Users/misiek/test/with-build-plugin-gatsby-baseline/.cache/data/**",
    ],
    external_node_modules: ["msgpackr-extract"],
    node_bundler: "esbuild",
  },
};

console.log(JSON.stringify(t, null, 2));
