const { setClerkApiKey, setClerkJwtKey } = require('@clerk/clerk-sdk-node/src');
let exportLib = {};

if (process.env.NEXT_RUNTIME === 'edge') {
  const sdk = require('./dist/edge-middleware');
  exportLib.clerkApi = {
    allowlistIdentifiers: sdk.allowlistIdentifiers,
    clients: sdk.clients,
    emails: sdk.emails,
    invitations: sdk.invitations,
    organizations: sdk.organizations,
    sessions: sdk.sessions,
    smsMessages: sdk.smsMessages,
    users: sdk.users,
  };
  exportLib.setApiKey = sdk.setClerkApiKey;
  exportLib.setJwtKey = sdk.setClerkJwtKey;
  exportLib.getAuth = require('./dist/server/getAuthEdge').getAuthEdge;
} else {
  // nodejs runtime assumed
  const sdk = require('./dist/api');
  exportLib.clerkApi = {
    allowlistIdentifiers: sdk.allowlistIdentifiers,
    clients: sdk.clients,
    emails: sdk.emails,
    invitations: sdk.invitations,
    organizations: sdk.organizations,
    sessions: sdk.sessions,
    smsMessages: sdk.smsMessages,
    users: sdk.users,
  };
  exportLib.setApiKey = sdk.setClerkApiKey;
  exportLib.setJwtKey = sdk.setClerkJwtKey;
  exportLib.getAuth = require('./dist/server/getAuthNode').getAuthNode;
}

exportLib.withClerkMiddleware = require('./dist/server/utils/withClerkMiddleware').withClerkMiddleware;

module.exports = exportLib;
