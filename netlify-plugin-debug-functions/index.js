const { copy, outputFile, readdir } = require("fs-extra");
const { join } = require(`path`);

const PUBLISH_DEBUG_DIRNAME = `nf-debug`;

module.exports = {
  onBuild: async ({ constants }) => {
    console.trace(`[NETLIFY] constants`, { constants });
  },
  onPostBuild: async ({ constants }) => {
    const outputLocation = join(constants.PUBLISH_DIR, PUBLISH_DEBUG_DIRNAME);
    try {
      const functionFiles = await readdir(constants.FUNCTIONS_DIST);

      // create index.html with links to all packaged functions
      await outputFile(
        join(outputLocation, `index.html`),
        `<html><body><h1>Packaged functions</h1><ul>${functionFiles
          .map(
            (functionFile) =>
              `<li><a href="${PUBLISH_DEBUG_DIRNAME}/${functionFile}" download>${functionFile}</a></li>`
          )
          .join(``)}</ul></body></html>`
      );

      // copy packaged functions to public
      await copy(constants.FUNCTIONS_DIST, outputLocation);
    } catch (e) {}
  },
};
