let exportLib = {};

if (process.env.NEXT_RUNTIME === 'edge') {
  exportLib = require('./dist/edge-middleware');
  exportLib.getAuth = require('./dist/server/getAuthEdge').getAuthEdge;
} else {
  // nodejs runtime assumed
  exportLib = require('./dist/api');
  exportLib.getAuth = require('./dist/server/getAuthNode').getAuthNode;
}

exportLib.withClerkMiddleware = require('./dist/server/utils/withClerkMiddleware').withClerkMiddleware;

module.exports = exportLib;
