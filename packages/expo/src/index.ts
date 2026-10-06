import { setErrorThrowerOptions } from '@clerk/react/internal';

export {
  isClerkAPIResponseError,
  isEmailLinkError,
  isKnownError,
  isMetamaskError,
  isClerkRuntimeError,
} from '@clerk/react/errors';

export { getClerkInstance } from './provider/singleton';

export * from './provider/ClerkProvider';
export * from './hooks';
export * from './components';
export * from './biometric-credentials/errors';
export * from './biometric-credentials/types';
export { useBiometricCredentials } from './biometric-credentials/deprecatedRootExport';
export * from './trusted-devices';

// Override Clerk React error thrower to show that errors come from @clerk/expo
setErrorThrowerOptions({ packageName: PACKAGE_NAME });

export type { TokenCache } from './cache/types';
