let exportLib = {};
exportLib.runClerkMiddleware = require('./dist/server/runClerkMiddleware').runClerkMiddleware;
if (process.env.NEXT_RUNTIME === 'edge') {
  exportLib.getAuth = require('./dist/server/getAuthEdge').getAuthEdge;
  exportLib.clerkApi = require('./dist/edge-middleware').clerkApi;
} else {
  exportLib.getAuth = require('./dist/server/getAuthNode').getAuthNode;
  exportLib.clerkApi = require('./dist/api').default;
}

module.exports = exportLib;
