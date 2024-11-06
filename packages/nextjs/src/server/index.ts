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
  OrganizationInvitationJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  SessionJSON,
  SMSMessageJSON,
  UserJSON,
  WebhookEvent,
  WebhookEventType,
  UserWebhookEvent,
  EmailWebhookEvent,
  SMSWebhookEvent,
  SessionWebhookEvent,
  OrganizationWebhookEvent,
  OrganizationMembershipWebhookEvent,
  OrganizationInvitationWebhookEvent,
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
  // Webhook event types
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
export {
  __experimental_reverificationMismatchResponse,
  __experimental_reverificationMismatch,
} from '@clerk/backend/internal';
