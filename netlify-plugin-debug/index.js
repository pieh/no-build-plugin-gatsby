const { copySync } = require("fs-extra");

module.exports = {
  onBuild: async ({ constants }) => {
    console.trace(`[NETLIFY] constants`, { constants });
  },
  onPostBuild: async ({ constants }) => {
    // copy packaged functions to public
    copySync(constants.FUNCTIONS_DIST, constants.PUBLISH_DIR);
  },
};
