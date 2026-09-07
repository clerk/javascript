import { requireOptionalNativeModule } from 'expo';

import type { NativeRuntimeModule } from '../provider/nativeRuntime';
import type { NativeAuthFlowModule, NativeBiometricCredentialModule } from './NativeClerkModule.types';

export interface Spec extends NativeAuthFlowModule, NativeBiometricCredentialModule, Partial<NativeRuntimeModule> {
  // Exposed by Expo Modules EventEmitter for internal native client change events.
  // This is not part of the public @clerk/expo API.
  addListener?(eventName: string, listener?: (...args: unknown[]) => void): { remove: () => void };
}

export default requireOptionalNativeModule<Spec>('ClerkExpo');
