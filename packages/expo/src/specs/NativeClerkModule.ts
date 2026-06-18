import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Required by NativeEventEmitter for internal native client change events.
  // This is not part of the public @clerk/expo API.
  addListener(eventName: string): void;
  configure(publishableKey: string, bearerToken: string | null): Promise<void>;
  getClientToken(): Promise<string | null>;
  syncFromJsClientToken(
    clientToken: string | null,
    sourceId: string | null,
    shouldRefreshClient?: boolean,
  ): Promise<void>;
  // Required by NativeEventEmitter for internal native client change events.
  // This is not part of the public @clerk/expo API.
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.get<Spec>('ClerkExpo');
