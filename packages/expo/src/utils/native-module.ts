import { Platform } from 'react-native';

import NativeClerkModule from '../specs/NativeClerkModule';

export const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

type ClerkExpoNativeModule = {
  addListener?(eventName: string, listener?: (...args: unknown[]) => void): { remove: () => void };
  configure(publishableKey: string, bearerToken: string | null): Promise<void>;
  getClientToken(): Promise<string | null>;
  syncClientStateFromJs(
    deviceToken: string | null,
    sourceId: string | null,
    didChangeClient: boolean,
    didChangeDeviceToken: boolean,
  ): Promise<void>;
};

function isClerkExpoModule(module: unknown): module is ClerkExpoNativeModule {
  if (!module || typeof module !== 'object') {
    return false;
  }
  const maybeModule = module as Record<string, unknown>;

  return (
    typeof maybeModule.configure === 'function' &&
    typeof maybeModule.getClientToken === 'function' &&
    typeof maybeModule.syncClientStateFromJs === 'function'
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

  if (__DEV__ && nativeModule) {
    console.warn('[ClerkExpo] Native module does not satisfy the expected contract.');
  }

  return null;
}

export const ClerkExpoModule = loadNativeModule();
