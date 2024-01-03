/**
 * Generic exports
 */
import { createRouteMatcher } from './routeMatcher';

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
export { clerkMiddleware } from './clerkMiddleware';

/**
 * Returns a function that accepts a `Request` object and returns whether the request matches the list of
 * predefined routes that can be passed in as the first argument.
 *
 * You can use glob patterns to match multiple routes or a function to match against the request object.
 * Path patterns and regular expressions are supported, for example: `['/foo', '/bar(.*)'] or `[/^\/foo\/.*$/]`
 * For more information, see: https://clerk.com/docs
 */
export const experimental_createRouteMatcher = createRouteMatcher;
