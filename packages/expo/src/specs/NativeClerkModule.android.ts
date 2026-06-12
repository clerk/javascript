import { requireNativeModule } from 'expo';

type NativeMap = Record<string, unknown>;

interface Spec {
  // addListener/removeListeners are present on the iOS RN event emitter module.
  // Android uses Expo Modules EventEmitter instead.
  addListener?(eventName: string): void;
  configure(publishableKey: string, bearerToken: string | null): Promise<void>;
  getSession(): Promise<NativeMap | null>;
  getClientToken(): Promise<string | null>;
  refreshClient(): Promise<void>;
  removeListeners?(count: number): void;
}

export default requireNativeModule<Spec>('ClerkExpo');
