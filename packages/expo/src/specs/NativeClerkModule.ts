import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypesNamespace';

export interface Spec extends TurboModule {
  // Required by NativeEventEmitter for internal native auth-state events.
  // This is not part of the public @clerk/expo API.
  addListener(eventName: string): void;
  configure(publishableKey: string, bearerToken: string | null): Promise<void>;
  getSession(): Promise<UnsafeObject | null>;
  getClientToken(): Promise<string | null>;
  refreshClient(): Promise<void>;
  // Required by NativeEventEmitter for internal native auth-state events.
  // This is not part of the public @clerk/expo API.
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.get<Spec>('ClerkExpo');
