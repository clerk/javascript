import { requireOptionalNativeModule } from 'expo';

export interface Spec {
  // Exposed by Expo Modules EventEmitter for internal native client change events.
  // This is not part of the public @clerk/expo API.
  addListener?(eventName: string, listener?: (...args: unknown[]) => void): { remove: () => void };
  configure(publishableKey: string, bearerToken: string | null): Promise<void>;
  // Optional: absent on binaries built before proxy support; callers must feature-detect and
  // fall back to configure(), otherwise OTA-updated JS breaks on older binaries.
  configureWithOptions?(
    publishableKey: string,
    options: { bearerToken: string | null; proxyUrl: string | null },
  ): Promise<void>;
  getClientToken(): Promise<string | null>;
  syncClientStateFromJs(
    deviceToken: string | null,
    sourceId: string | null,
    didChangeClient: boolean,
    didChangeDeviceToken: boolean,
  ): Promise<void>;
}

export default requireOptionalNativeModule<Spec>('ClerkExpo');
