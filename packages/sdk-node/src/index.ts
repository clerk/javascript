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

export default clerkClient;

export type { LooseAuthProp, StrictAuthProp, WithAuthProp, RequireAuthProp, ClerkMiddleware, ClerkMiddlewareOptions };

export { createClerkExpressRequireAuth, ClerkExpressRequireAuth } from './clerkExpressRequireAuth';
export { createClerkExpressWithAuth, ClerkExpressWithAuth } from './clerkExpressWithAuth';

export const setClerkApiKey = (value: string) => {
  clerkClient.__unstable_options.apiKey = value;
};

export const setClerkServerApiUrl = (value: string) => {
  clerkClient.__unstable_options.apiKey = value;
};

export const setClerkApiVersion = (value: string) => {
  clerkClient.__unstable_options.apiVersion = value;
};

export const setClerkHttpOptions = (value: RequestInit) => {
  clerkClient.__unstable_options.httpOptions = value;
};
