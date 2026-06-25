import { requireNativeModule } from 'expo';

interface Spec {
  // addListener/removeListeners are present on the iOS RN event emitter module.
  // Android uses Expo Modules EventEmitter instead.
  addListener?(eventName: string): void;
  configure(publishableKey: string, bearerToken: string | null): Promise<void>;
  getClientToken(): Promise<string | null>;
  syncClientStateFromJs(
    deviceToken: string | null,
    sourceId: string | null,
    didChangeClient: boolean,
    didChangeDeviceToken: boolean,
  ): Promise<void>;
  removeListeners?(count: number): void;
}

export default requireNativeModule<Spec>('ClerkExpo');
