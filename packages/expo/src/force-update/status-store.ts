import { Platform } from 'react-native';

import { getNativeAppInfo, type NativeAppInfo } from './nativeAppInfo';
import { defaultForceUpdateStatus, type ForceUpdateStatus } from './types';
import { compareAppVersions, isValidAppVersion } from './version';

type ForceUpdatePolicySnakeCase = {
  bundle_id?: unknown;
  package_name?: unknown;
  minimum_version?: unknown;
  update_url?: unknown;
};

type IOSForceUpdatePolicy = {
  bundleId: string;
  minimumVersion: string;
  updateUrl: string | null;
};

type AndroidForceUpdatePolicy = {
  packageName: string;
  minimumVersion: string;
  updateUrl: string | null;
};

type ForceUpdateResource = {
  ios?: IOSForceUpdatePolicy[];
  android?: AndroidForceUpdatePolicy[];
};

type NormalizedForceUpdateResource = {
  ios: IOSForceUpdatePolicy[];
  android: AndroidForceUpdatePolicy[];
};

type ForceUpdateSource = {
  forceUpdate?: ForceUpdateResource | null;
  force_update?: {
    ios?: ForceUpdatePolicySnakeCase[];
    android?: ForceUpdatePolicySnakeCase[];
  } | null;
};

type UnsupportedAppVersionMeta = {
  platform?: unknown;
  app_identifier?: unknown;
  current_version?: unknown;
  minimum_version?: unknown;
  update_url?: unknown;
};

const subscribers = new Set<() => void>();

let currentForceUpdateStatus: ForceUpdateStatus = defaultForceUpdateStatus();

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
};

const supportedStatus = (
  currentVersion: string | null,
  minimumVersion: string | null,
  updateURL: string | null,
  reason: ForceUpdateStatus['reason'],
): ForceUpdateStatus => ({
  isSupported: true,
  currentVersion,
  minimumVersion,
  updateURL,
  reason,
});

const normalizeSnakeCaseForceUpdate = (
  source: NonNullable<ForceUpdateSource['force_update']>,
): NormalizedForceUpdateResource => {
  return {
    ios: (source.ios || []).flatMap(policy => {
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
    android: (source.android || []).flatMap(policy => {
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

const normalizeForceUpdate = (source: ForceUpdateResource): NormalizedForceUpdateResource => {
  return {
    ios: source.ios || [],
    android: source.android || [],
  };
};

const getForceUpdatePolicies = (source: ForceUpdateSource | null | undefined): NormalizedForceUpdateResource | null => {
  if (!source) {
    return null;
  }

  if (source.forceUpdate) {
    return normalizeForceUpdate(source.forceUpdate);
  }

  if (source.force_update) {
    return normalizeSnakeCaseForceUpdate(source.force_update);
  }

  return null;
};

const findPolicy = (
  policies: NormalizedForceUpdateResource | null,
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

const isSameStatus = (left: ForceUpdateStatus, right: ForceUpdateStatus): boolean => {
  return (
    left.isSupported === right.isSupported &&
    left.currentVersion === right.currentVersion &&
    left.minimumVersion === right.minimumVersion &&
    left.updateURL === right.updateURL &&
    left.reason === right.reason
  );
};

const setForceUpdateStatus = (nextStatus: ForceUpdateStatus): void => {
  if (isSameStatus(currentForceUpdateStatus, nextStatus)) {
    return;
  }

  currentForceUpdateStatus = nextStatus;
  subscribers.forEach(subscriber => subscriber());
};

export const getForceUpdateStatus = (): ForceUpdateStatus => currentForceUpdateStatus;

export const subscribeForceUpdateStatus = (subscriber: () => void): (() => void) => {
  subscribers.add(subscriber);

  return () => {
    subscribers.delete(subscriber);
  };
};

export const resolveForceUpdateStatus = (
  source: ForceUpdateSource | null | undefined,
  appInfo: NativeAppInfo,
): ForceUpdateStatus => {
  const currentVersion = asNonEmptyString(appInfo.currentVersion);
  if (!currentVersion) {
    return supportedStatus(null, null, null, 'missing_current_version');
  }

  if (!isValidAppVersion(currentVersion)) {
    return supportedStatus(currentVersion, null, null, 'invalid_current_version');
  }

  const matchingPolicy = findPolicy(getForceUpdatePolicies(source), appInfo);
  if (!matchingPolicy) {
    return supportedStatus(currentVersion, null, null, 'no_policy');
  }

  if (!isValidAppVersion(matchingPolicy.minimumVersion)) {
    return supportedStatus(
      currentVersion,
      matchingPolicy.minimumVersion,
      matchingPolicy.updateURL,
      'invalid_minimum_version',
    );
  }

  if (compareAppVersions(currentVersion, matchingPolicy.minimumVersion) >= 0) {
    return supportedStatus(currentVersion, matchingPolicy.minimumVersion, matchingPolicy.updateURL, 'supported');
  }

  return {
    isSupported: false,
    currentVersion,
    minimumVersion: matchingPolicy.minimumVersion,
    updateURL: matchingPolicy.updateURL,
    reason: 'below_minimum',
  };
};

export const refreshForceUpdateStatus = async (source: ForceUpdateSource | null | undefined): Promise<ForceUpdateStatus> => {
  const appInfo = await getNativeAppInfo();
  const nextStatus = resolveForceUpdateStatus(source, appInfo);
  setForceUpdateStatus(nextStatus);
  return nextStatus;
};

export const resolveForceUpdateStatusFromErrorMeta = (
  meta: unknown,
  appInfo: NativeAppInfo,
): ForceUpdateStatus | null => {
  if (!meta || typeof meta !== 'object') {
    return null;
  }

  const normalizedMeta = meta as UnsupportedAppVersionMeta;
  const platform = asNonEmptyString(normalizedMeta.platform);

  if (platform && platform !== Platform.OS) {
    return null;
  }

  const expectedIdentifier = Platform.OS === 'ios' ? asNonEmptyString(appInfo.bundleId) : asNonEmptyString(appInfo.packageName);
  const appIdentifier = asNonEmptyString(normalizedMeta.app_identifier);
  if (expectedIdentifier && appIdentifier && expectedIdentifier !== appIdentifier) {
    return null;
  }

  const minimumVersion = asNonEmptyString(normalizedMeta.minimum_version);
  if (!minimumVersion) {
    return null;
  }

  const currentVersion = asNonEmptyString(normalizedMeta.current_version) || asNonEmptyString(appInfo.currentVersion);

  return {
    isSupported: false,
    currentVersion,
    minimumVersion,
    updateURL: asNonEmptyString(normalizedMeta.update_url),
    reason: 'server_rejected',
  };
};

export const applyForceUpdateStatusFromErrorMeta = async (meta: unknown): Promise<ForceUpdateStatus | null> => {
  const appInfo = await getNativeAppInfo();
  const nextStatus = resolveForceUpdateStatusFromErrorMeta(meta, appInfo);
  if (!nextStatus) {
    return null;
  }

  setForceUpdateStatus(nextStatus);
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

export const __internal_resetForceUpdateStatus = (): void => {
  currentForceUpdateStatus = defaultForceUpdateStatus();
  subscribers.clear();
};
