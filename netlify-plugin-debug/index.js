module.exports = {
  onBuild: async ({ constants }) => {
    console.trace(`[NETLIFY] constants`, { constants });
  },
};
