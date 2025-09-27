const app = require('../index');

// Vercel Node serverless function handler that delegates to the Express app
module.exports = (req, res) => {
  return app(req, res);
};
