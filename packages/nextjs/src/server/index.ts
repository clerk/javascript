/**
 * Generic exports
 */
export { verifyToken, createClerkClient } from '@clerk/backend';
export type { WebhookEvent, WebhookEventType } from '@clerk/backend';
export { clerkClient } from './clerkClient';

/**
 * NextJS-specific exports
 */
export { buildClerkProps, getAuth } from './getAuth';
export { redirectToSignIn, redirectToSignUp } from './redirect';
export { auth } from '../app-router/server/auth';
export { currentUser } from '../app-router/server/currentUser';
export { authMiddleware } from './authMiddleware';
