import { Platform } from 'react-native';

import { isExpoGo } from '../utils/runtime';

export type NativeAppPlatform = 'ios' | 'android';

export type NativeAppIdentity = {
  platform: NativeAppPlatform;
  appIdentifier: string;
  version: string;
  displayVersion: string;
};

type ExpoApplication = {
  applicationId: string | null;
  applicationName: string | null;
  nativeApplicationVersion: string | null;
  nativeBuildVersion: string | null;
};

let cachedIdentity: NativeAppIdentity | null | undefined;

export function getNativeAppIdentity(): NativeAppIdentity | null {
  if (cachedIdentity === undefined) {
    cachedIdentity = readNativeAppIdentity();
  }
  return cachedIdentity;
}

export function getNativeAppPlatform(): NativeAppPlatform | null {
  return Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : null;
}

function readNativeAppIdentity(): NativeAppIdentity | null {
  const platform = getNativeAppPlatform();
  if (!platform || isExpoGo()) {
    return null;
  }
  const application = loadExpoApplication();
  const appIdentifier = application?.applicationId;
  const version = platform === 'ios' ? application?.nativeApplicationVersion : application?.nativeBuildVersion;
  if (!appIdentifier || !version) {
    return null;
  }
  return { platform, appIdentifier, version, displayVersion: application?.nativeApplicationVersion || version };
}

export function getNativeAppName(): string | null {
  return loadExpoApplication()?.applicationName || null;
}

export function isExpoApplicationInstalled(): boolean {
  return loadExpoApplication() !== null;
}

function loadExpoApplication(): ExpoApplication | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-application') as ExpoApplication;
  } catch {
    return null;
  }
}

export function setNativeAppIdentityHeaders(headers: Headers): void {
  const identity = getNativeAppIdentity();
  if (!identity) {
    return;
  }
  headers.set(identity.platform === 'ios' ? 'x-bundle-id' : 'x-package-name', identity.appIdentifier);
  headers.set('x-app-version', identity.version);
}
