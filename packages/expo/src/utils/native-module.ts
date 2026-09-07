import { Platform } from 'react-native';

import type { NativeRuntimeModule } from '../provider/nativeRuntime';
import NativeClerkModule from '../specs/NativeClerkModule';
import type { NativeAuthFlowModule, NativeBiometricCredentialModule } from '../specs/NativeClerkModule.types';

export const isNativeSupported = Platform.OS === 'ios';

export type ClerkExpoNativeModule = {
  addListener?(eventName: string, listener?: (...args: unknown[]) => void): { remove: () => void };
} & Partial<NativeAuthFlowModule & NativeBiometricCredentialModule & NativeRuntimeModule>;

function isClerkExpoModule(module: unknown): module is ClerkExpoNativeModule {
  if (!module || typeof module !== 'object') {
    return false;
  }
  const maybeModule = module as Record<string, unknown>;

  return [
    'addListener',
    'configureExternalRuntime',
    'publishRuntimeState',
    'completeRuntimeOperation',
    'detachRuntime',
    'performRuntimeCapability',
  ].every(method => typeof maybeModule[method] === 'function');
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
