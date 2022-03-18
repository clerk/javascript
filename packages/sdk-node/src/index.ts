import { OptionsOfUnknownResponseBody } from 'got';

import Clerk from './instance';

// Export collections
export const singletonInstance = Clerk.getInstance();
export const allowlistIdentifiers = singletonInstance.allowlistIdentifiers;
export const clients = singletonInstance.clients;
export const emails = singletonInstance.emails;
export const invitations = singletonInstance.invitations;
export const sessions = singletonInstance.sessions;
export const smsMessages = singletonInstance.smsMessages;
export const users = singletonInstance.users;

// Export a default singleton instance that should suffice for most use cases
export default singletonInstance;

// Export resources
export {
  Nullable,
  AllowlistIdentifier,
  Client,
  Email,
  EmailAddress,
  ExternalAccount,
  IdentificationLink,
  Invitation,
  PhoneNumber,
  Session,
  SMSMessage,
  User,
  Verification,
  Token,
} from './instance';

// Export middleware functions
export const ClerkExpressWithAuth = singletonInstance.expressWithAuth.bind(singletonInstance);

export const ClerkExpressRequireAuth = singletonInstance.expressRequireAuth.bind(singletonInstance);

export const withAuth = singletonInstance.withAuth.bind(singletonInstance);

export const requireAuth = singletonInstance.requireAuth.bind(singletonInstance);

// Export wrapper types for Next.js requests
export {
  WithAuthProp,
  RequireAuthProp,
  RequestWithAuth,
  RequestWithRequiredAuth,
  RequireAuth,
  WithAuthReturn,
  WithAuth,
  WithAuthHandler,
  MiddlewareOptions,
} from './Clerk';

// Export Errors
export { HttpError, ClerkServerError, ClerkServerErrorJSON } from './utils/Errors';

// Export Logger
export { default as Logger } from './utils/Logger';

// Export setters for the default singleton instance
// Useful if you only have access to a sub-api instance

export function setClerkApiKey(value: string) {
  Clerk.getInstance().apiKey = value;
}

export function setClerkServerApiUrl(value: string) {
  Clerk.getInstance().serverApiUrl = value;
}

export function setClerkApiVersion(value: string) {
  Clerk.getInstance().apiVersion = value;
}

export function setClerkHttpOptions(value: OptionsOfUnknownResponseBody) {
  Clerk.getInstance().httpOptions = value;
}
