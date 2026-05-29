/**
 * Generic exports
 */
export { createRouteMatcher } from './routeMatcher';

export { verifyToken, createClerkClient } from '@clerk/backend';
export { clerkClient } from './clerkClient';

/**
 * Webhook-specific exports
 */
export type {
  DeletedObjectJSON,
  EmailJSON,
  OrganizationJSON,
  OrganizationDomainJSON,
  OrganizationDomainVerificationJSON,
  OrganizationInvitationJSON,
  OrganizationMembershipJSON,
  SessionJSON,
  SMSMessageJSON,
  UserJSON,
  WaitlistEntryJSON,
  WebhookEvent,
  WebhookEventType,
  UserWebhookEvent,
  EmailWebhookEvent,
  OrganizationWebhookEvent,
  OrganizationDomainWebhookEvent,
  OrganizationMembershipWebhookEvent,
  OrganizationInvitationWebhookEvent,
  PermissionWebhookEvent,
  RoleWebhookEvent,
  SessionWebhookEvent,
  SMSWebhookEvent,
  WaitlistEntryWebhookEvent,
} from '@clerk/backend';

/**
 * NextJS-specific exports
 *
 * NOTE: `auth` and `currentUser` are re-exported from `./index.rsc.ts` only,
 * which is selected via the `react-server` export condition. Loading them
 * outside the RSC layer (e.g. from pages-router code) would transitively
 * import `server-only` and crash at module load.
 */
export { getAuth } from './createGetAuth';
export { buildClerkProps } from './buildClerkProps';
export { clerkMiddleware } from './clerkMiddleware';
export type { ClerkMiddlewareAuth, ClerkMiddlewareSessionAuthObject, ClerkMiddlewareOptions } from './clerkMiddleware';

/**
 * Re-export resource types from @clerk/backend
 */
export type {
  OrganizationMembershipRole,
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

/**
 * Utilities for reverification
 */
export { reverificationErrorResponse, reverificationError } from '@clerk/backend/internal';

/**
 * Frontend API proxy exports
 */
export {
  clerkFrontendApiProxy,
  createFrontendApiProxyHandlers,
  type FrontendApiProxyHandlers,
  type FrontendApiProxyOptions,
  type NextFrontendApiProxyOptions,
} from './proxy';
