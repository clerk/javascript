import { Clerk } from '@clerk/backend';

import { clerkClient } from '../server';

const createClerkClient = Clerk;

export { createClerkClient };

export * from '@clerk/backend';

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
};
