let exportLib;
if (process.env.NEXT_RUNTIME === 'edge') {
  exportLib = require('./dist/edge-middleware');
  exportLib.withAuth = exportLib.withEdgeMiddlewareAuth;
} else {
  exportLib = require('./dist/api');
}

module.exports = exportLib;
