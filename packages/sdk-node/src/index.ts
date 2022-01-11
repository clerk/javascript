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
const ClerkExpressWithSession =
  singletonInstance.expressWithSession.bind(singletonInstance);
const ClerkExpressRequireSession =
  singletonInstance.expressRequireSession.bind(singletonInstance);
const withSession = singletonInstance.withSession.bind(singletonInstance);
const requireSession = singletonInstance.requireSession.bind(singletonInstance);
export {
  ClerkExpressWithSession,
  ClerkExpressRequireSession,
  withSession,
  requireSession,
};

// Export wrapper types for Next.js requests
export {
  WithSessionProp,
  RequireSessionProp,
  WithSessionClaimsProp,
  RequireSessionClaimsProp,
} from './instance';

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
