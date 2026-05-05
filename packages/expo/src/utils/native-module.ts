import { Platform } from 'react-native';

import NativeClerkModule from '../specs/NativeClerkModule';

export const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

function loadNativeModule(): typeof NativeClerkModule | null {
  if (!isNativeSupported) {
    return null;
  }
  try {
    return NativeClerkModule;
  } catch (e) {
    if (__DEV__) {
      console.warn('[ClerkExpo] Native module not available:', e);
    }
    return null;
  }
}

export const ClerkExpoModule = loadNativeModule();
