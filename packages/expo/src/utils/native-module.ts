import { Platform } from 'react-native';

import { NATIVE_BRIDGE_VERSION } from '../constants';
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

const BRIDGE_METHODS = ['configureNative', 'getDeviceToken', 'setDeviceToken', 'refreshClient'] as const;

function hasBridgeMethods(module: Record<string, unknown>) {
  return BRIDGE_METHODS.every(name => typeof module[name] === 'function');
}

function readBridgeVersion(module: Record<string, unknown>): number | null {
  if (module.bridgeVersion === undefined) {
    return hasBridgeMethods(module) ? 1 : null;
  }
  return Number.isInteger(module.bridgeVersion) ? (module.bridgeVersion as number) : null;
}

function isClerkExpoModule(
  module: Record<string, unknown>,
  bridgeVersion: number | null,
): module is ClerkExpoNativeModule {
  return bridgeVersion === NATIVE_BRIDGE_VERSION && hasBridgeMethods(module);
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

  const module = nativeModule as Record<string, unknown>;
  const bridgeVersion = readBridgeVersion(module);
  if (isClerkExpoModule(module, bridgeVersion)) {
    return module;
  }

  const reason =
    bridgeVersion === NATIVE_BRIDGE_VERSION
      ? `native bridge version ${bridgeVersion} is missing bridge methods`
      : `native bridge version ${bridgeVersion ?? 'unknown'}, expected ${NATIVE_BRIDGE_VERSION}`;
  console.error(
    `Clerk: Native components are disabled because this app's native build doesn't match @clerk/expo ${PACKAGE_VERSION} ` +
      `(${reason}). ` +
      'Update @clerk/expo and @clerk/expo-native-components together to their latest versions, then rebuild the app.',
  );

  return null;
}

export const ClerkExpoModule = loadNativeModule();
