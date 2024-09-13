export * from '@clerk/backend';

export { clerkClient } from './clerkClient';

export type { ClerkMiddleware, ExpressRequestWithAuth } from './types';
export { clerkMiddleware } from './clerkMiddleware';
export { getAuth } from './getAuth';
export { requireAuth, ForbiddenError, UnauthorizedError } from './requireAuth';
