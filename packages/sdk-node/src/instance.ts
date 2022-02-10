import Clerk from './Clerk';

export default Clerk;

export {
  WithSessionProp,
  RequireSessionProp,
  WithSessionClaimsProp,
  RequireSessionClaimsProp,
  WithAuthProp,
  RequireAuthProp,
} from './Clerk';

export {
  HttpError,
  ClerkServerError,
  ClerkServerErrorJSON,
} from './utils/Errors';
export { default as Logger } from './utils/Logger';

export {
  AllowlistIdentifier,
  Client,
  Email,
  EmailAddress,
  ExternalAccount,
  IdentificationLink,
  Invitation,
  Nullable,
  PhoneNumber,
  Session,
  SMSMessage,
  User,
  Verification,
} from '@clerk/backend-core';
