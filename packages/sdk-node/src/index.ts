import { clerkClient, createClerkClient } from './clerkClient';
import type {
  ClerkMiddleware,
  ClerkMiddlewareOptions,
  LooseAuthProp,
  RequireAuthProp,
  StrictAuthProp,
  WithAuthProp,
} from './types';

export * from '@clerk/backend';
export { createClerkClient, clerkClient };

const { users, smsMessages, sessions, emailAddresses, phoneNumbers, emails, invitations, organizations, clients } =
  clerkClient;

export { users, smsMessages, sessions, emailAddresses, phoneNumbers, emails, invitations, organizations, clients };

export default clerkClient;

export type { LooseAuthProp, StrictAuthProp, WithAuthProp, RequireAuthProp, ClerkMiddleware, ClerkMiddlewareOptions };

export { createClerkExpressRequireAuth, ClerkExpressRequireAuth } from './clerkExpressRequireAuth';
export { createClerkExpressWithAuth, ClerkExpressWithAuth } from './clerkExpressWithAuth';
