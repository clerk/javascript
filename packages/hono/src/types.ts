import type { ClerkClient } from '@clerk/backend';
import type { GetAuthFnNoRequest } from '@clerk/backend/internal';

/**
 * Variables that clerkMiddleware sets on the Hono context.
 * Access via c.get('clerk') and c.get('clerkAuth').
 */
export type ClerkHonoVariables = {
  clerk: ClerkClient;
  clerkAuth: GetAuthFnNoRequest;
};
