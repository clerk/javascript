import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';
import { logger } from '@clerk/shared/logger';

logger.warnOnce(`
Clerk - DEPRECATION WARNING: @clerk/clerk-expo is deprecated.

Please migrate to @clerk/expo.

Migration guide: https://clerk.com/docs/guides/development/upgrading/upgrade-guides/core-3
`);

export {
  isClerkAPIResponseError,
  isEmailLinkError,
  isKnownError,
  isMetamaskError,
  isClerkRuntimeError,
} from '@clerk/clerk-react/errors';

/**
 * @deprecated Use `getClerkInstance()` instead.
 */
export { clerk as Clerk } from './provider/singleton';
export { getClerkInstance } from './provider/singleton';

export * from './provider/ClerkProvider';
export * from './hooks';
export * from './components';

// Override Clerk React error thrower to show that errors come from @clerk/clerk-expo
setErrorThrowerOptions({ packageName: PACKAGE_NAME });

export type { TokenCache } from './cache/types';
