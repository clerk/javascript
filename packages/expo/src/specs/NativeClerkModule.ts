import { requireOptionalNativeModule } from 'expo';

import type { NativeAuthFlowModule, NativeBiometricCredentialModule } from './NativeClerkModule.types';

export interface Spec extends NativeAuthFlowModule, NativeBiometricCredentialModule {
  // Exposed by Expo Modules EventEmitter for internal native client change events.
  // This is not part of the public @clerk/expo API.
  addListener?(eventName: string, listener?: (...args: unknown[]) => void): { remove: () => void };
  configure(publishableKey: string, bearerToken: string | null): Promise<void>;
  getClientToken(): Promise<string | null>;
  syncClientStateFromJs(
    deviceToken: string | null,
    sourceId: string | null,
    didChangeClient: boolean,
    didChangeDeviceToken: boolean,
  ): Promise<void>;
}

export default requireOptionalNativeModule<Spec>('ClerkExpo');
