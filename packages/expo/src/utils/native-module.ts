import { Platform } from 'react-native';

import NativeClerkModule from '../specs/NativeClerkModule';

export const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

function loadNativeModule(): typeof NativeClerkModule | null {
  if (!isNativeSupported) {
    return null;
  }
  let nativeModule: typeof NativeClerkModule | null = null;

  try {
    nativeModule = NativeClerkModule;
  } catch (e) {
    if (__DEV__) {
      console.warn('[ClerkExpo] Native module not available:', e);
    }
  }

  if (nativeModule?.configure) {
    return nativeModule;
  }

  try {
    // Expo SDK 54 can expose installed modules through Expo's module registry even
    // when the generated TurboModule object is incomplete.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { requireNativeModule } = require('expo');
    return requireNativeModule('ClerkExpo') ?? nativeModule;
  } catch (e) {
    if (__DEV__ && !nativeModule) {
      console.warn('[ClerkExpo] Native module not available:', e);
    }
    if (nativeModule) {
      return nativeModule;
    }
    return null;
  }
}

export const ClerkExpoModule = loadNativeModule();
