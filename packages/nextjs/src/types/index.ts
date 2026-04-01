/**
 * Re-exports all types from @clerk/shared/types along with Next.js-specific types.
 * This allows consumers to import types from @clerk/nextjs/types instead of
 * installing @clerk/types separately.
 */

// Re-export all shared types
export type * from '@clerk/shared/types';

// Next.js-specific types from this package
export type { NextClerkProviderProps } from '../types';

// Middleware types
export type {
  ClerkMiddlewareAuth,
  ClerkMiddlewareOptions,
  ClerkMiddlewareSessionAuthObject,
} from '../server/clerkMiddleware';
