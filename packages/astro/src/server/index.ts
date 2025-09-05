import type { SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend/internal';

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
 * @deprecated Use `AuthObject` instead. This type only supports session auth.
 * `context.locals.auth()` can now return an `AuthObject` with session and machine auth support.
 */
type GetAuthReturn = SignedInAuthObject | SignedOutAuthObject;
export type { GetAuthReturn };

/**
 * This will be used to define types of Astro.Locals inside `env.d.ts`
 */
export type { AuthFn } from './types';
