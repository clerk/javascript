import Clerk from './Clerk';

export default Clerk;

export {
  WithSessionProp,
  RequireSessionProp,
  WithSessionClaimsProp,
  RequireSessionClaimsProp,
} from './Clerk';

export {
  HttpError,
  ClerkServerError,
  ClerkServerErrorJSON,
} from './utils/Errors';
import Logger from './utils/Logger';
export { Logger };
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
