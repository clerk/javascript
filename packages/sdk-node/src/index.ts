import { OptionsOfUnknownResponseBody } from 'got';

import Clerk from './instance';

const singletonInstance = Clerk.getInstance();
const allowlistIdentifiers = singletonInstance.allowlistIdentifiers;
const clients = singletonInstance.clients;
const emails = singletonInstance.emails;
const invitations = singletonInstance.invitations;
const sessions = singletonInstance.sessions;
const smsMessages = singletonInstance.smsMessages;
const users = singletonInstance.users;

// Export a default singleton instance that should suffice for most use cases
export default singletonInstance;

// Export sub-api objects
export {
  allowlistIdentifiers,
  clients,
  emails,
  invitations,
  sessions,
  smsMessages,
  users,
};

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
} from './instance';

// Export middleware functions

/** @deprecated DEPRECATED Use ClerkExpressWithAuth Est. 2.10.0 */
const ClerkExpressWithSession =
  singletonInstance.expressWithSession.bind(singletonInstance);

/** @deprecated DEPRECATED Use ClerkExpressRequireAuth Est. 2.10.0 */
const ClerkExpressRequireSession =
  singletonInstance.expressRequireSession.bind(singletonInstance);

/** @deprecated DEPRECATED Use withAuth Est. 2.10.0 */
const withSession = singletonInstance.withSession.bind(singletonInstance);

/** @deprecated DEPRECATED Use requireAuth Est. 2.10.0 */
const requireSession = singletonInstance.requireSession.bind(singletonInstance);

const ClerkExpressWithAuth =
  singletonInstance.expressWithSession.bind(singletonInstance);
const ClerkExpressRequireAuth =
  singletonInstance.expressRequireSession.bind(singletonInstance);
const withAuth = singletonInstance.withSession.bind(singletonInstance);
const requireAuth = singletonInstance.requireSession.bind(singletonInstance);

export {
  ClerkExpressWithSession,
  ClerkExpressRequireSession,
  ClerkExpressWithAuth,
  ClerkExpressRequireAuth,
  withSession,
  requireSession,
  withAuth,
  requireAuth,
};

// Export wrapper types for Next.js requests
export {
  WithSessionProp,
  RequireSessionProp,
  WithSessionClaimsProp,
  RequireSessionClaimsProp,
  WithAuthProp,
  RequireAuthProp,
} from './Clerk';

// Export Errors
export {
  HttpError,
  ClerkServerError,
  ClerkServerErrorJSON,
} from './utils/Errors';

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
