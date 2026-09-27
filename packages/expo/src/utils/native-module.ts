import { Platform } from 'react-native';

import NativeClerkModule from '../specs/NativeClerkModule';
import type {
  NativeAuthFlowModule,
  NativeBiometricCredentialModule,
  NativeClientSyncModule,
} from '../specs/NativeClerkModule.types';

export const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

export type ClerkExpoNativeModule = {
  addListener?(eventName: string, listener?: (...args: unknown[]) => void): { remove: () => void };
} & NativeClientSyncModule &
  Partial<NativeAuthFlowModule & NativeBiometricCredentialModule>;

function isClerkExpoModule(module: unknown): module is ClerkExpoNativeModule {
  if (!module || typeof module !== 'object') {
    return false;
  }
  const maybeModule = module as Record<string, unknown>;

  return (
    typeof maybeModule.configureNative === 'function' &&
    typeof maybeModule.getDeviceToken === 'function' &&
    typeof maybeModule.setDeviceToken === 'function' &&
    typeof maybeModule.refreshClient === 'function'
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
