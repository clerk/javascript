import Clerk from './Clerk';

export default Clerk;

export {
  WithSessionProp,
  RequireSessionProp,
  WithSessionClaimsProp,
  RequireSessionClaimsProp,
} from './Clerk';

export { Nullable } from './resources/Nullable';
export {
  HttpError,
  ClerkServerError,
  ClerkServerErrorJSON,
} from './utils/Errors';
import Logger from './utils/Logger';
export { Logger };
export { AllowlistIdentifier } from './resources/AllowlistIdentifier';
export { Client } from './resources/Client';
export { Email } from './resources/Email';
export { EmailAddress } from './resources/EmailAddress';
export { ExternalAccount } from './resources/ExternalAccount';
export { IdentificationLink } from './resources/IdentificationLink';
export { Invitation } from './resources/Invitation';
export { PhoneNumber } from './resources/PhoneNumber';
export { Session } from './resources/Session';
export { SMSMessage } from './resources/SMSMessage';
export { User } from './resources/User';
export { Verification } from './resources/Verification';
