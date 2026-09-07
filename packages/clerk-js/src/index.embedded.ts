export { Clerk } from './core/clerk';
export { createEmbeddedClerk } from './embedded/core';

export {
  installPasskeyHooks,
  installAppleHooks,
  installBiometricHooks,
  installAppAttestHooks,
} from './embedded/nativeHooks';
