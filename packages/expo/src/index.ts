import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';

export { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react/errors';

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
