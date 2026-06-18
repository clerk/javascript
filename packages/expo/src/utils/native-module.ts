import { Platform } from 'react-native';

import NativeClerkModule from '../specs/NativeClerkModule';

export const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

type ClerkExpoNativeModule = {
  addListener(eventName: string, listener?: (...args: unknown[]) => void): { remove: () => void };
  configure(publishableKey: string, bearerToken: string | null): Promise<void>;
  getClientToken(): Promise<string | null>;
  removeListeners(count: number): void;
  syncFromJsClientToken(clientToken: string | null, sourceId: string | null): Promise<void>;
};

function isClerkExpoModule(module: unknown): module is ClerkExpoNativeModule {
  if (!module || typeof module !== 'object') {
    return false;
  }
  const maybeModule = module as Record<string, unknown>;

  return (
    typeof maybeModule.addListener === 'function' &&
    typeof maybeModule.configure === 'function' &&
    typeof maybeModule.getClientToken === 'function' &&
    typeof maybeModule.removeListeners === 'function' &&
    typeof maybeModule.syncFromJsClientToken === 'function'
  );
}

function loadNativeModule(): ClerkExpoNativeModule | null {
  if (!isNativeSupported) {
    return null;
  }
  let nativeModule: unknown = null;

  try {
    nativeModule = NativeClerkModule;
  } catch (e) {
    if (__DEV__) {
      console.warn('[ClerkExpo] Native module not available:', e);
    }
  }

  if (isClerkExpoModule(nativeModule)) {
    return nativeModule;
  }

  try {
    // Expo SDK 54 can expose installed modules through Expo's module registry even
    // when the generated TurboModule object is incomplete.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { requireNativeModule } = require('expo');
    const expoModule = requireNativeModule('ClerkExpo');
    return isClerkExpoModule(expoModule) ? expoModule : null;
  } catch (e) {
    if (__DEV__ && !nativeModule) {
      console.warn('[ClerkExpo] Native module not available:', e);
    }
    return null;
  }
}

export const ClerkExpoModule = loadNativeModule();
