import { Platform } from 'react-native';

export type NativeAppInfo = {
  currentVersion: string | null;
  bundleId: string | null;
  packageName: string | null;
};

let nativeAppInfoPromise: Promise<NativeAppInfo> | null = null;

const emptyAppInfo = (): NativeAppInfo => ({
  currentVersion: null,
  bundleId: null,
  packageName: null,
});

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
};

const loadExpoApplicationModule = async (): Promise<Record<string, unknown> | null> => {
  const moduleName = 'expo-application';

  try {
    return (await import(moduleName)) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const loadNativeAppInfo = async (): Promise<NativeAppInfo> => {
  const applicationModule = await loadExpoApplicationModule();
  if (!applicationModule) {
    return emptyAppInfo();
  }

  const currentVersion = asNonEmptyString(applicationModule.nativeApplicationVersion);
  const applicationId = asNonEmptyString(applicationModule.applicationId);

  if (Platform.OS === 'ios') {
    return {
      currentVersion,
      bundleId: applicationId,
      packageName: null,
    };
  }

  if (Platform.OS === 'android') {
    return {
      currentVersion,
      bundleId: null,
      packageName: applicationId,
    };
  }

  return emptyAppInfo();
};

export const getNativeAppInfo = async (): Promise<NativeAppInfo> => {
  nativeAppInfoPromise = nativeAppInfoPromise ?? loadNativeAppInfo();
  return nativeAppInfoPromise;
};

export const __internal_resetNativeAppInfo = (): void => {
  nativeAppInfoPromise = null;
};

export const __internal_setNativeAppInfo = (appInfo: NativeAppInfo): void => {
  nativeAppInfoPromise = Promise.resolve(appInfo);
};
