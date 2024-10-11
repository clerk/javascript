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

export * from '@clerk/backend';
/**
 * The order of these exports is important, as we want Clerk from clerk/clerk-sdk-node
 * to shadow the Clerk export from clerk/backend, because it needs to support
 * 2 additional apis: clerk.expressWithAuth, clerk.expressRequireAuth
 */
export { clerkClient, ClerkExpressRequireAuth, ClerkExpressWithAuth, createClerkClient };

export type { ClerkMiddleware, ClerkMiddlewareOptions, LooseAuthProp, RequireAuthProp, StrictAuthProp, WithAuthProp };

export { createClerkExpressRequireAuth, createClerkExpressWithAuth };

export { requireAuth } from './requireAuth';
export { withAuth } from './withAuth';

console.warn(
  'Starting October 8, 2024, the Node SDK is entering a three-month notice period. ' +
    'We encourage everyone to migrate to @clerk/express. ' +
    'For full details, please see our changelog: https://clerk.com/changelog/2024-10-08-express-sdk',
);
