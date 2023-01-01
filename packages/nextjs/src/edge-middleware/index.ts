import { requireAuth, withAuth } from '../api';
import { clerkClient } from '../server';

export * from '../api';
export { clerkClient };
export const clerkApi = clerkClient;
export const requireEdgeMiddlewareAuth = requireAuth;
export const withEdgeMiddlewareAuth = withAuth;
