let exportLib = {};

if (process.env.NEXT_RUNTIME === 'edge') {
  const sdk = require('./dist/edge-middleware');
  exportLib.clerkClient = sdk.clerkClient;
  exportLib.createClerkClient = sdk.createClerkClient;
  exportLib.getAuth = require('./dist/server/getAuthEdge').getAuthEdge;
} else {
  // nodejs runtime assumed
  const sdk = require('./dist/api');
  exportLib.clerkClient = sdk.clerkClient;
  exportLib.createClerkClient = sdk.createClerkClient;
  exportLib.getAuth = require('./dist/server/getAuthNode').getAuthNode;
}

exportLib.withClerkMiddleware = require('./dist/server/utils/withClerkMiddleware').withClerkMiddleware;

module.exports = exportLib;
