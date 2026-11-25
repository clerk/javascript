import { Platform } from 'react-native';

import NativeClerkModule from '../specs/NativeClerkModule';
import type {
  NativeAuthFlowModule,
  NativeClientSyncModule,
  NativeUpdateRequiredViewModule,
} from '../specs/NativeClerkModule.types';

export const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

export type ClerkExpoNativeModule = {
  addListener?(eventName: string, listener?: (...args: unknown[]) => void): { remove: () => void };
} & NativeClientSyncModule &
  Partial<NativeAuthFlowModule> &
  Partial<NativeUpdateRequiredViewModule>;

const NATIVE_BRIDGE_VERSION = 1;

const BRIDGE_V1_METHODS = ['configureNative', 'getDeviceToken', 'setDeviceToken', 'refreshClient'] as const;

function readBridgeVersion(module: object): number | null {
  const maybeModule = module as Record<string, unknown>;
  if (typeof maybeModule.bridgeVersion === 'number') {
    return maybeModule.bridgeVersion;
  }
  return BRIDGE_V1_METHODS.every(name => typeof maybeModule[name] === 'function') ? 1 : null;
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
      console.warn('Clerk: Native module not available:', e);
    }
  }

  if (!nativeModule || typeof nativeModule !== 'object') {
    return null;
  }

  const bridgeVersion = readBridgeVersion(nativeModule);
  if (bridgeVersion === NATIVE_BRIDGE_VERSION) {
    return nativeModule as ClerkExpoNativeModule;
  }

  console.error(
    `Clerk: Native components are disabled because this app's native build doesn't match @clerk/expo ${PACKAGE_VERSION} ` +
      `(native bridge version ${bridgeVersion ?? 'unknown'}, expected ${NATIVE_BRIDGE_VERSION}). ` +
      'Update @clerk/expo and @clerk/expo-native-components together to their latest versions, then rebuild the app.',
  );

  return null;
}

export const ClerkExpoModule = loadNativeModule();
