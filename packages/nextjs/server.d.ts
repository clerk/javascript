export { AuthData } from './dist/server/types';

export { withClerkMiddleware } from './dist/server/utils/withClerkMiddleware';

export { getAuthEdge as getAuth } from './dist/server/getAuthEdge';
export { setClerkApiKey as setApiKey } from './dist/api';
export { setClerkJwtKey as setJwtKey } from './dist/api';

import * as sdk from './dist/api';

export declare namespace clerkApi {
  export const allowlistIdentifiers: typeof sdk.allowlistIdentifiers;
  export const clients: typeof sdk.clients;
  export const emails: typeof sdk.emails;
  export const invitations: typeof sdk.invitations;
  export const organizations: typeof sdk.organizations;
  export const sessions: typeof sdk.sessions;
  export const smsMessages: typeof sdk.smsMessages;
  export const users: typeof sdk.users;
}
