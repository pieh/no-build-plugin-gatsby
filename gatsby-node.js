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
};
