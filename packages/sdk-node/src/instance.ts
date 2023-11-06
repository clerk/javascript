import { deprecated } from '@clerk/shared';

import { Clerk } from './clerkClient';

export default Clerk;

export type { RequireAuthProp, WithAuthProp } from './types';

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
  SMSMessage,
  Session,
  User,
  Verification,
} from '@clerk/backend';

deprecated('@clerk/clerk-sdk-node/instance', 'Use `@clerk/clerk-sdk-node` instead.');
