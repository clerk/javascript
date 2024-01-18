/**
 * Generic exports
 */
export { createRouteMatcher } from './routeMatcher';

export { verifyToken, createClerkClient } from '@clerk/backend';
export type { WebhookEvent, WebhookEventType } from '@clerk/backend';
export { clerkClient } from './clerkClient';

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
 * Deprecated APIs
 * These APIs will be removed in v6
 */
export { authMiddleware } from './authMiddleware';
export { redirectToSignIn, redirectToSignUp } from './redirectHelpers';
