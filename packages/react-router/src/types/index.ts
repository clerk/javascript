/**
 * Re-exports all types from @clerk/shared/types along with React Router-specific types.
 * This allows consumers to import types from @clerk/react-router/types instead of
 * installing @clerk/types separately.
 */

// Re-export all shared types
export type * from '@clerk/shared/types';

// React Router client-specific types
export type { ClerkState, ReactRouterClerkProviderProps, WithClerkState } from '../client/types';

// React Router server-specific types
export type {
  ClerkMiddlewareOptions,
  GetAuthReturn,
  LoaderFunctionArgsWithAuth,
  LoaderFunctionReturn,
  RequestStateWithRedirectUrls,
  RequestWithAuth,
  RootAuthLoaderCallback,
  RootAuthLoaderOptions,
} from '../server/types';
