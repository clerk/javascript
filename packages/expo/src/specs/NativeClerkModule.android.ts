import { requireOptionalNativeModule } from 'expo';

import type {
  NativeAuthFlowModule,
  NativeBiometricCredentialModule,
  NativeClientSyncModule,
} from './NativeClerkModule.types';

interface Spec extends NativeAuthFlowModule, NativeBiometricCredentialModule, NativeClientSyncModule {
  // Exposed by Expo Modules EventEmitter for the internal `clerkNativeClientInvalidated` event.
  // This is not part of the public @clerk/expo API.
  addListener?(eventName: string, listener?: (...args: unknown[]) => void): { remove: () => void };
}

// Optional so it resolves to null in Expo Go instead of throwing at import time.
export default requireOptionalNativeModule<Spec>('ClerkExpo');
