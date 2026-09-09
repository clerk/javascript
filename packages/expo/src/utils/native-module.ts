import { Platform } from 'react-native';

import NativeClerkModule from '../specs/NativeClerkModule';
import type { NativeAuthFlowModule, NativeResourceModule } from '../specs/NativeClerkModule.types';

export const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

export type ClerkExpoNativeModule = NativeResourceModule & Partial<NativeAuthFlowModule>;

function isClerkExpoModule(module: unknown): module is ClerkExpoNativeModule {
  if (!module || typeof module !== 'object') {
    return false;
  }
  const maybeModule = module as Record<string, unknown>;

  return [
    'prepareCore',
    'startCore',
    'receiveCoreMessage',
    'detachCore',
    'performCoreCapability',
    'cancelCoreCapabilities',
    'addListener',
  ].every(name => typeof maybeModule[name] === 'function');
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
