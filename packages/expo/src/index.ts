import { setErrorThrowerOptions } from '@clerk/react/internal';

export {
  isClerkAPIResponseError,
  isEmailLinkError,
  isKnownError,
  isMetamaskError,
  isClerkRuntimeError,
} from '@clerk/react/errors';

/**
 * @deprecated Use `getClerkInstance()` instead.
 */
export { clerk as Clerk } from './provider/singleton';
export { getClerkInstance } from './provider/singleton';

export * from './provider/ClerkProvider';
export * from './hooks';
export * from './components';
export { UNSAFE_PortalProvider } from '@clerk/react';

// Override Clerk React error thrower to show that errors come from @clerk/expo
setErrorThrowerOptions({ packageName: PACKAGE_NAME });

export type { TokenCache } from './cache/types';
