import { clerkClient, ClerkExpressRequireAuth, ClerkExpressWithAuth, createClerkClient } from './clerkClient';
import { createClerkExpressRequireAuth } from './clerkExpressRequireAuth';
import { createClerkExpressWithAuth } from './clerkExpressWithAuth';
import type {
  ClerkMiddleware,
  ClerkMiddlewareOptions,
  LooseAuthProp,
  RequireAuthProp,
  StrictAuthProp,
  WithAuthProp,
} from './types';

// eslint-disable-next-line import/export
export * from '@clerk/backend';
/**
 * The order of these exports is important, as we want Clerk from clerk/sdk-node
 * to shadow the Clerk export from clerk/backend, because it needs to support
 * 2 additional apis: clerk.expressWithAuth, clerk.expressRequireAuth
 */
// eslint-disable-next-line import/export
export { clerkClient, ClerkExpressRequireAuth, ClerkExpressWithAuth, createClerkClient };

const {
  users,
  sessions,
  emailAddresses,
  phoneNumbers,
  emails,
  invitations,
  organizations,
  clients,
  allowlistIdentifiers,
  domains,
} = clerkClient;

export {
  allowlistIdentifiers,
  clients,
  domains,
  emailAddresses,
  emails,
  invitations,
  organizations,
  phoneNumbers,
  sessions,
  users,
};

export type { ClerkMiddleware, ClerkMiddlewareOptions, LooseAuthProp, RequireAuthProp, StrictAuthProp, WithAuthProp };

export { createClerkExpressRequireAuth, createClerkExpressWithAuth };

export { requireAuth } from './requireAuth';
export { withAuth } from './withAuth';
