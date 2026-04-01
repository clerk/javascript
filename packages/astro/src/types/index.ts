/**
 * Re-export all shared types
 */
export type * from '@clerk/shared/types';

/**
 * Astro-specific types
 */
export type {
  AstroClerkUpdateOptions,
  AstroClerkIntegrationParams,
  AstroClerkCreateInstanceParams,
  ProtectProps,
  ButtonProps,
  InternalUIComponentId,
} from '../types';

/**
 * Astro server types
 */
export type {
  AstroMiddleware,
  AstroMiddlewareContextParam,
  AstroMiddlewareNextParam,
  AstroMiddlewareReturn,
  SessionAuthObjectWithRedirect,
  AuthFn,
} from '../server/types';
