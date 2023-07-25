// exports.sourceNodes = ({ actions }) => {
//   actions.createNode({
//     id: `wat-1`,
//     string: `string`,
//     number: 5,
//     internal: {
//       type: `Wat`,
//       contentDigest: `wat`,
//     },
//   });
// };

// exports.createResolvers = ({ createResolvers }) => {
//   createResolvers({
//     Wat: {
//       wat: {
//         type: `String`,
//         resolve: () => {
//           throw new Error(`hey`);
//         },
//       },
//     },
//   });
// };

// exports.createPages = async ({ graphql }) => {
//   const r = await graphql(`
//     {
//       allWat {
//         nodes {
//           wat
//         }
//       }
//     }
//   `);

//   console.log(require(`util`).inspect(r, { depth: Infinity, colors: true }));
// };
exports.createPages = async ({ actions }) => {
  actions.createRedirect({
    fromPath: `/test-not-permanent-redirect/`,
    toPath: `/`,
  });

  actions.createRedirect({
    fromPath: `/test-permanent-redirect/`,
    toPath: `/`,
    isPermanent: true,
  });

  actions.createRedirect({
    fromPath: `/test-rewrite/`,
    toPath: `/`,
    statusCode: 200,
  });

  actions.createSlice({
    id: `test`,
    component: require.resolve(`./src/components/slice-test.js`),
  });

  actions.createSlice({
    id: `test-alternative`,
    component: require.resolve(`./src/components/slice-test-alternative.js`),
  });

  actions.createPage({
    path: `/ssg/slices/slice-props/`,
    component: require.resolve(`./src/pages/ssg/slices/defaults.js`),
    context: {
      setting: `overwrite`,
    },
  });

  actions.createPage({
    path: `/ssg/slices/slice-alternative/`,
    component: require.resolve(`./src/pages/ssg/slices/defaults.js`),
    slices: {
      test: `test-alternative`,
    },
  });
};

exports.onPostBuild = () => {
  // console.log(`updating lambda.js`);
  // require(`fs`).copyFileSync("src/lambda.js", ".cache/page-ssr/lambda.js");
  // console.log(`updated lambda.js`);
};

exports.createSchemaCustomization = function createSchemaCustomization({
  actions,
}) {
  actions.createTypes(`
    type UnsplashImage implements Node & RemoteFile {
      id: ID!
    }
  `);
};

exports.sourceNodes = function sourceNodes({ actions }) {
  const imageURL = `https://images.unsplash.com/photo-1672823841196-3ec078a2befd`;
  actions.createNode({
    id: "unsplash-image-1",
    internal: {
      type: "UnsplashImage",
      contentDigest: `1`,
    },
    url: imageURL,
    filename: imageURL,
    mimeType: `image/jpeg`,
    width: 1940,
    height: 3118,
  });
};
