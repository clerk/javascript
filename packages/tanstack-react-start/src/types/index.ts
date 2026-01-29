/**
 * Re-exports all types from @clerk/shared/types along with TanStack Start-specific types.
 * This allows consumers to import types from @clerk/tanstack-react-start/types instead of
 * installing @clerk/types separately.
 */

// Re-export all shared types
export type * from '@clerk/shared/types';

// TanStack Start client-specific types
export type { ClerkState, TanstackStartClerkProviderProps } from '../client/types';

// TanStack Start server-specific types
export type { AdditionalStateOptions, ClerkMiddlewareOptions, LoaderOptions } from '../server/types';
