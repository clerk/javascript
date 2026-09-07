import { Clerk } from './core/clerk';

export {
  ClerkAPIResponseError,
  ClerkRuntimeError,
  EmailLinkError,
  EmailLinkErrorCode,
  EmailLinkErrorCodeStatus,
  isClerkAPIResponseError,
  isClerkRuntimeError,
  isEmailLinkError,
  isKnownError,
  isMetamaskError,
  isUserLockedError,
  type MetamaskError,
} from '@clerk/shared/error';
export { Clerk };
export { createNativeAdapter as __internal_createNativeAdapter } from './embedded/core';
export type { EmbeddedHost, EmbeddedOptions, EmbeddedState, EmbeddedInvocation } from './embedded/core';

if (module.hot) {
  module.hot.accept();
}
export {
  installPasskeyHooks as __internal_installNativePasskeyHooks,
  installAppleHooks as __internal_installNativeAppleHooks,
  installBiometricHooks as __internal_installNativeBiometricHooks,
  installAppAttestHooks as __internal_installNativeAppAttestHooks,
} from './embedded/nativeHooks';
