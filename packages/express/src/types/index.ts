// Re-export all shared types
export type * from '@clerk/shared/types';

// Re-export Express-specific types
export type { AuthenticateRequestParams, ClerkMiddlewareOptions, ExpressRequestWithAuth } from '../types';
