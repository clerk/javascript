import Clerk from './Clerk';

export default Clerk;

export { WithAuthProp, RequireAuthProp } from './Clerk';

export { HttpError, ClerkServerError, ClerkServerErrorJSON } from './utils/Errors';
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
  Token,
} from '@clerk/backend-core';
