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
  HeadlessBrowserClerk,
  BrowserClerk,
  ProtectParams,
  ProtectProps,
  ShowProps,
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

/**
 * Astro React types
 */
export type { SignInButtonProps, SignUpButtonProps } from '../react/types';
