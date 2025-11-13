export { rootAuthLoader } from '../server/rootAuthLoader';
export { getAuth } from '../server/getAuth';
import { logger } from '@clerk/shared/logger';

logger.warnOnce(`
Clerk - DEPRECATION WARNING: \`@clerk/react-router/ssr.server\` has been deprecated and will be removed in the next major version.

Import from \`@clerk/react-router/server\` instead.

Before:
  import { getAuth, clerkMiddleware, rootAuthLoader } from '@clerk/react-router/ssr.server';

After:
  import { getAuth, clerkMiddleware, rootAuthLoader } from '@clerk/react-router/server';
`);

/**
 * Re-export resource types from @clerk/backend
 */
export type {
  OrganizationMembershipRole,
  // Webhook event types
  WebhookEvent,
  WebhookEventType,
  // Resources
  AllowlistIdentifier,
  Client,
  EmailAddress,
  ExternalAccount,
  Invitation,
  OauthAccessToken,
  Organization,
  OrganizationDomain,
  OrganizationInvitation,
  OrganizationMembership,
  OrganizationMembershipPublicUserData,
  PhoneNumber,
  Session,
  SignInToken,
  SMSMessage,
  Token,
  User,
} from '@clerk/backend';
