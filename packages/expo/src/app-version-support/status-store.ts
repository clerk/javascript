import { Platform } from 'react-native';

import { getNativeAppInfo, type NativeAppInfo } from './nativeAppInfo';
import { type AppVersionSupportStatus, defaultAppVersionSupportStatus } from './types';
import { compareAppVersions, isValidAppVersion } from './version';

type MinimumSupportedVersionPolicySnakeCase = {
  bundle_id?: unknown;
  package_name?: unknown;
  minimum_version?: unknown;
  update_url?: unknown;
};

type IOSMinimumSupportedVersionPolicy = {
  bundleId: string;
  minimumVersion: string;
  updateUrl: string | null;
};

type AndroidMinimumSupportedVersionPolicy = {
  packageName: string;
  minimumVersion: string;
  updateUrl: string | null;
};

type MinimumSupportedVersionResource = {
  ios?: IOSMinimumSupportedVersionPolicy[];
  android?: AndroidMinimumSupportedVersionPolicy[];
};

type NormalizedAppVersionSupportResource = {
  ios: IOSMinimumSupportedVersionPolicy[];
  android: AndroidMinimumSupportedVersionPolicy[];
};

type AppVersionSupportSource = {
  nativeAppSettings?: {
    minimumSupportedVersion?: MinimumSupportedVersionResource | null;
  } | null;
  native_app_settings?: {
    minimum_supported_version?: {
      ios?: MinimumSupportedVersionPolicySnakeCase[];
      android?: MinimumSupportedVersionPolicySnakeCase[];
    } | null;
  } | null;
};

type UnsupportedAppVersionMeta = {
  platform?: unknown;
  app_identifier?: unknown;
  minimum_version?: unknown;
  update_url?: unknown;
};

const subscribers = new Set<() => void>();

let currentAppVersionSupportStatus: AppVersionSupportStatus = defaultAppVersionSupportStatus();

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
};

const supportedStatus = (): AppVersionSupportStatus => ({
  isSupported: true,
  minimumVersion: null,
  updateURL: null,
});

const normalizeSnakeCaseMinimumSupportedVersion = (
  source: NonNullable<AppVersionSupportSource['native_app_settings']>,
): NormalizedAppVersionSupportResource => {
  const minimumSupportedVersion = source.minimum_supported_version;
  return {
    ios: (minimumSupportedVersion?.ios || []).flatMap(policy => {
      const bundleId = asNonEmptyString(policy.bundle_id);
      const minimumVersion = asNonEmptyString(policy.minimum_version);
      if (!bundleId || !minimumVersion) {
        return [];
      }

      return [
        {
          bundleId,
          minimumVersion,
          updateUrl: asNonEmptyString(policy.update_url),
        },
      ];
    }),
    android: (minimumSupportedVersion?.android || []).flatMap(policy => {
      const packageName = asNonEmptyString(policy.package_name);
      const minimumVersion = asNonEmptyString(policy.minimum_version);
      if (!packageName || !minimumVersion) {
        return [];
      }

      return [
        {
          packageName,
          minimumVersion,
          updateUrl: asNonEmptyString(policy.update_url),
        },
      ];
    }),
  };
};

const normalizeMinimumSupportedVersion = (
  source: NonNullable<AppVersionSupportSource['nativeAppSettings']>,
): NormalizedAppVersionSupportResource => {
  const minimumSupportedVersion = source.minimumSupportedVersion;
  return {
    ios: minimumSupportedVersion?.ios || [],
    android: minimumSupportedVersion?.android || [],
  };
};

const getAppVersionSupportPolicies = (
  source: AppVersionSupportSource | null | undefined,
): NormalizedAppVersionSupportResource | null => {
  if (!source) {
    return null;
  }

  if (source.nativeAppSettings) {
    return normalizeMinimumSupportedVersion(source.nativeAppSettings);
  }

  if (source.native_app_settings) {
    return normalizeSnakeCaseMinimumSupportedVersion(source.native_app_settings);
  }

  return null;
};

const findPolicy = (
  policies: NormalizedAppVersionSupportResource | null,
  appInfo: NativeAppInfo,
): { minimumVersion: string; updateURL: string | null } | null => {
  if (!policies) {
    return null;
  }

  if (Platform.OS === 'ios') {
    const bundleId = asNonEmptyString(appInfo.bundleId);
    if (!bundleId) {
      return null;
    }

    const matchingPolicy = policies.ios.find(policy => policy.bundleId === bundleId);
    if (!matchingPolicy) {
      return null;
    }

    return {
      minimumVersion: matchingPolicy.minimumVersion,
      updateURL: matchingPolicy.updateUrl,
    };
  }

  if (Platform.OS === 'android') {
    const packageName = asNonEmptyString(appInfo.packageName);
    if (!packageName) {
      return null;
    }

    const matchingPolicy = policies.android.find(policy => policy.packageName === packageName);
    if (!matchingPolicy) {
      return null;
    }

    return {
      minimumVersion: matchingPolicy.minimumVersion,
      updateURL: matchingPolicy.updateUrl,
    };
  }

  return null;
};

const isSameStatus = (left: AppVersionSupportStatus, right: AppVersionSupportStatus): boolean => {
  return (
    left.isSupported === right.isSupported &&
    left.minimumVersion === right.minimumVersion &&
    left.updateURL === right.updateURL
  );
};

const setAppVersionSupportStatus = (nextStatus: AppVersionSupportStatus): void => {
  if (isSameStatus(currentAppVersionSupportStatus, nextStatus)) {
    return;
  }

  currentAppVersionSupportStatus = nextStatus;
  subscribers.forEach(subscriber => subscriber());
};

export const getAppVersionSupportStatus = (): AppVersionSupportStatus => currentAppVersionSupportStatus;

export const subscribeAppVersionSupportStatus = (subscriber: () => void): (() => void) => {
  subscribers.add(subscriber);

  return () => {
    subscribers.delete(subscriber);
  };
};

export const resolveAppVersionSupportStatus = (
  source: AppVersionSupportSource | null | undefined,
  appInfo: NativeAppInfo,
): AppVersionSupportStatus => {
  const currentVersion = asNonEmptyString(appInfo.currentVersion);
  if (!currentVersion) {
    return supportedStatus();
  }

  if (!isValidAppVersion(currentVersion)) {
    return supportedStatus();
  }

  const matchingPolicy = findPolicy(getAppVersionSupportPolicies(source), appInfo);
  if (!matchingPolicy) {
    return supportedStatus();
  }

  if (!isValidAppVersion(matchingPolicy.minimumVersion)) {
    return supportedStatus();
  }

  if (compareAppVersions(currentVersion, matchingPolicy.minimumVersion) >= 0) {
    return supportedStatus();
  }

  return {
    isSupported: false,
    minimumVersion: matchingPolicy.minimumVersion,
    updateURL: matchingPolicy.updateURL,
  };
};

export const refreshAppVersionSupportStatus = async (
  source: AppVersionSupportSource | null | undefined,
): Promise<AppVersionSupportStatus> => {
  if (!source && !currentAppVersionSupportStatus.isSupported) {
    return currentAppVersionSupportStatus;
  }

  const appInfo = await getNativeAppInfo();
  const nextStatus = resolveAppVersionSupportStatus(source, appInfo);
  setAppVersionSupportStatus(nextStatus);
  return nextStatus;
};

export const resolveAppVersionSupportStatusFromErrorMeta = (
  meta: unknown,
  appInfo: NativeAppInfo,
): AppVersionSupportStatus | null => {
  if (!meta || typeof meta !== 'object') {
    return null;
  }

  const normalizedMeta = meta as UnsupportedAppVersionMeta;
  const platform = asNonEmptyString(normalizedMeta.platform);

  if (platform && platform !== Platform.OS) {
    return null;
  }

  const expectedIdentifier =
    Platform.OS === 'ios' ? asNonEmptyString(appInfo.bundleId) : asNonEmptyString(appInfo.packageName);
  const appIdentifier = asNonEmptyString(normalizedMeta.app_identifier);
  if (expectedIdentifier && appIdentifier && expectedIdentifier !== appIdentifier) {
    return null;
  }

  const minimumVersion = asNonEmptyString(normalizedMeta.minimum_version);
  if (!minimumVersion) {
    return null;
  }

  return {
    isSupported: false,
    minimumVersion,
    updateURL: asNonEmptyString(normalizedMeta.update_url),
  };
};

export const applyAppVersionSupportStatusFromErrorMeta = async (
  meta: unknown,
): Promise<AppVersionSupportStatus | null> => {
  const appInfo = await getNativeAppInfo();
  const nextStatus = resolveAppVersionSupportStatusFromErrorMeta(meta, appInfo);
  if (!nextStatus) {
    return null;
  }

  setAppVersionSupportStatus(nextStatus);
  return nextStatus;
};

export const attachNativeAppHeaders = async (headers: Headers): Promise<void> => {
  const appInfo = await getNativeAppInfo();
  const currentVersion = asNonEmptyString(appInfo.currentVersion);

  if (currentVersion) {
    headers.set('x-app-version', currentVersion);
  }

  if (Platform.OS === 'ios') {
    const bundleId = asNonEmptyString(appInfo.bundleId);
    if (bundleId) {
      headers.set('x-bundle-id', bundleId);
    }
  }

  if (Platform.OS === 'android') {
    const packageName = asNonEmptyString(appInfo.packageName);
    if (packageName) {
      headers.set('x-package-name', packageName);
    }
  }
};

export const __internal_resetAppVersionSupportStatus = (): void => {
  currentAppVersionSupportStatus = defaultAppVersionSupportStatus();
  subscribers.clear();
};
