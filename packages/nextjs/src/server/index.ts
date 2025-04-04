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
 */
export { getAuth } from './createGetAuth';
export { buildClerkProps } from './buildClerkProps';
export { auth } from '../app-router/server/auth';
export { currentUser } from '../app-router/server/currentUser';
export { clerkMiddleware } from './clerkMiddleware';
export type { ClerkMiddlewareAuth, ClerkMiddlewareAuthObject, ClerkMiddlewareOptions } from './clerkMiddleware';

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
  OAuthAccessToken,
  Organization,
  OrganizationInvitation,
  OrganizationMembershipPublicUserData,
  PhoneNumber,
  Session,
  SignInToken,
  Token,
  User,
} from '@clerk/backend';

/**
 * Utilities for reverification
 */
export { reverificationErrorResponse, reverificationError } from '@clerk/backend/internal';
