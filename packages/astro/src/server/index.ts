/**
 * Re-export utilities
 */
export { verifyToken, createClerkClient } from '@clerk/backend';

/**
 * Re-export types
 */
export type {
  OrganizationMembershipRole,
  // Webhook event types
  WebhookEvent,
  WebhookEventType,
  // Resources
  AllowlistIdentifier,
  Client,
  OrganizationMembership,
  EmailAddress,
  ExternalAccount,
  Invitation,
  OauthAccessToken,
  Organization,
  OrganizationInvitation,
  OrganizationMembershipPublicUserData,
  PhoneNumber,
  Session,
  SignInToken,
  SMSMessage,
  Token,
  User,
} from '@clerk/backend';

export { clerkMiddleware } from './clerk-middleware';
export { createRouteMatcher } from './route-matcher';
export { clerkClient } from './clerk-client';

export { buildClerkHotloadScript } from './build-clerk-hotload-script';

export { getClientSafeEnv } from './get-safe-env';

/**
 * This will be used to define types of Astro.Locals inside `env.d.ts`
 */
export type { GetAuthReturn } from './get-auth';
