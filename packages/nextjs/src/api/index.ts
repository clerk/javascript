import { Clerk } from '@clerk/backend';
export type {
  ClerkMiddleware,
  ClerkMiddlewareOptions,
  LooseAuthProp,
  RequireAuthProp,
  StrictAuthProp,
  WithAuthProp,
} from '@clerk/clerk-sdk-node';

import { clerkClient } from '../server/clerkClient';

export * from '@clerk/backend';

const createClerkClient = Clerk;

export { requireAuth } from './requireAuth';
export { withAuth } from './withAuth';

const {
  users,
  smsMessages,
  sessions,
  emailAddresses,
  phoneNumbers,
  emails,
  invitations,
  organizations,
  clients,
  allowlistIdentifiers,
} = clerkClient;

export {
  users,
  smsMessages,
  sessions,
  emailAddresses,
  phoneNumbers,
  emails,
  invitations,
  organizations,
  clients,
  allowlistIdentifiers,
  createClerkClient,
  clerkClient,
};
