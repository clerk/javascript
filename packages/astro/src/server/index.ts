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

export { clerkMiddleware } from './clerk-middleware';
export { createRouteMatcher } from './route-matcher';
export { clerkClient } from './clerk-client';

/**
 * This will be used to define types of Astro.Locals inside `env.d.ts`
 */
export type { GetAuthReturn } from './get-auth';
