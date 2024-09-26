export * from '@clerk/backend';

export { clerkClient } from './clerkClient';

export type { ExpressRequestWithAuth } from './types';
export { clerkMiddleware } from './clerkMiddleware';
export { getAuth } from './getAuth';
export { requireAuth } from './requireAuth';
