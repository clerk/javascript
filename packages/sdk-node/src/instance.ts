import { Clerk } from '@clerk/backend';

export default Clerk;

export { WithAuthProp, RequireAuthProp } from './types';

export {
  AllowlistIdentifier,
  Client,
  Email,
  EmailAddress,
  ExternalAccount,
  IdentificationLink,
  Invitation,
  Organization,
  OrganizationInvitation,
  OrganizationMembership,
  OrganizationMembershipPublicUserData,
  PhoneNumber,
  Session,
  SMSMessage,
  User,
  Verification,
} from '@clerk/backend';
