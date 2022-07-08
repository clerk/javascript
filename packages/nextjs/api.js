let exportLib;
if (process.env.NEXT_RUNTIME === 'edge') {
  exportLib = require('./dist/edge-middleware');
  exportLib.withAuth = exportLib.withEdgeMiddlewareAuth;
  exportLib.requireAuth = exportLib.requireEdgeMiddlewareAuth;
} else {
  exportLib = require('./dist/api');
}

module.exports = exportLib;
