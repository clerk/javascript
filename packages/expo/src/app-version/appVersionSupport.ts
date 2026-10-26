import type { NativeAppIdentity, NativeAppPlatform } from './nativeAppIdentity';
import { getNativeAppIdentity, getNativeAppPlatform, isExpoApplicationInstalled } from './nativeAppIdentity';

/**
 * Whether this build of your app meets the minimum version set for it in the Clerk Dashboard.
 */
export type AppVersionSupportStatus = {
  /**
   * Whether this app version is supported. When it is `false`, Clerk rejects the app's requests until the user updates.
   */
  isSupported: boolean;
  /**
   * This build's version: its `CFBundleShortVersionString` on iOS and its `versionCode` on Android. `null` when it can't be read, such as in Expo Go or without `expo-application`.
   */
  currentVersion: string | null;
  /**
   * The oldest supported version, when a minimum is set for this app.
   */
  minimumVersion: string | null;
  /**
   * The store page to send users to so they can update.
   */
  updateUrl: string | null;
};

export type UpdateRequiredDisplay = {
  applicationName: string | null;
  logoImageUrl: string | null;
  supportEmail: string | null;
};

const EMPTY_DISPLAY: UpdateRequiredDisplay = { applicationName: null, logoImageUrl: null, supportEmail: null };

type MinimumVersionJSON = {
  bundle_id?: unknown;
  package_name?: unknown;
  minimum_version?: unknown;
  update_url?: unknown;
};

const IOS_VERSION = /^\d+(\.\d+){0,2}$/;
const ANDROID_VERSION_CODE = /^[1-9]\d*$/;

const listeners = new Set<() => void>();
let environmentStatus: AppVersionSupportStatus | null = null;
let serverAnswer: { isSupported: true } | { isSupported: false; meta: Record<string, unknown> } | null = null;
let requestSequence = 0;
let lastResetRequest = 0;
let lastAnsweredRequest = 0;
let status = supportedStatus();
let display = EMPTY_DISPLAY;
let missingExpoApplicationWarned = false;

export function subscribeToAppVersionSupport(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAppVersionSupportStatus(): AppVersionSupportStatus {
  return status;
}

export function getUpdateRequiredDisplay(): UpdateRequiredDisplay {
  return display;
}

export function nextAppVersionRequest(): number {
  requestSequence += 1;
  return requestSequence;
}

export function resetAppVersionSupport(): void {
  lastResetRequest = requestSequence;
  lastAnsweredRequest = requestSequence;
  environmentStatus = null;
  serverAnswer = null;
  display = EMPTY_DISPLAY;
  publish({ displayChanged: true, notifyLater: true });
}

export function applyFetchedEnvironment(environment: unknown, request: number): void {
  if (request <= lastResetRequest) {
    return;
  }
  environmentStatus = resolveEnvironmentStatus(environment);
  const nextDisplay = resolveDisplay(environment);
  const displayChanged = !sameDisplay(nextDisplay, display);
  if (displayChanged) {
    display = nextDisplay;
  }
  publish({ displayChanged });
}

export function applyUnsupportedAppVersion(meta: unknown, request: number): void {
  if (!acceptAnswer(request)) {
    return;
  }
  serverAnswer = { isSupported: false, meta: isRecord(meta) ? meta : {} };
  publish();
}

export function applySupportedAppVersion(request: number): void {
  if (!acceptAnswer(request)) {
    return;
  }
  serverAnswer = { isSupported: true };
  publish();
}

function acceptAnswer(request: number): boolean {
  if (request <= lastAnsweredRequest) {
    return false;
  }
  lastAnsweredRequest = request;
  return true;
}

function resolveEnvironmentStatus(environment: unknown): AppVersionSupportStatus {
  const identity = getNativeAppIdentity();
  const minimums = minimumVersionsForPlatform(environment, identity?.platform ?? getNativeAppPlatform());
  if (!identity) {
    warnIfExpoApplicationIsMissing(minimums.length > 0);
    return supportedStatus();
  }
  const policy = minimums.find(entry => appIdentifier(entry, identity.platform) === identity.appIdentifier);
  if (!policy) {
    return supportedStatus();
  }
  const minimumVersion = stringOrNull(policy.minimum_version);
  const meetsMinimum = minimumVersion ? isAtLeast(identity, minimumVersion) : null;
  return {
    isSupported: meetsMinimum !== false,
    currentVersion: identity.version,
    minimumVersion: meetsMinimum === null ? null : minimumVersion,
    updateUrl: httpUrlOrNull(policy.update_url),
  };
}

function minimumVersionsForPlatform(environment: unknown, platform: NativeAppPlatform | null): MinimumVersionJSON[] {
  if (!platform || !isRecord(environment)) {
    return [];
  }
  const settings = environment.native_app_settings;
  const minimums = isRecord(settings) ? settings.minimum_supported_version : undefined;
  const entries = isRecord(minimums) ? minimums[platform] : undefined;
  return Array.isArray(entries) ? entries.filter(isRecord) : [];
}

function appIdentifier(entry: MinimumVersionJSON, platform: NativeAppPlatform): string | null {
  return stringOrNull(platform === 'ios' ? entry.bundle_id : entry.package_name);
}

function isAtLeast(identity: NativeAppIdentity, minimumVersion: string): boolean | null {
  const current = parseVersion(identity.platform, identity.version);
  const required = parseVersion(identity.platform, minimumVersion);
  if (!current || !required) {
    return null;
  }
  for (let index = 0; index < Math.max(current.length, required.length); index++) {
    const difference = (current[index] ?? 0) - (required[index] ?? 0);
    if (difference !== 0) {
      return difference > 0;
    }
  }
  return true;
}

function parseVersion(platform: NativeAppPlatform, version: string): number[] | null {
  const pattern = platform === 'ios' ? IOS_VERSION : ANDROID_VERSION_CODE;
  if (!pattern.test(version)) {
    return null;
  }
  const components = version.split('.').map(Number);
  return components.every(Number.isSafeInteger) ? components : null;
}

function httpUrlOrNull(value: unknown): string | null {
  const url = stringOrNull(value);
  if (!url) {
    return null;
  }
  try {
    const parsed = new URL(url);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && parsed.hostname ? url : null;
  } catch {
    return null;
  }
}

function warnIfExpoApplicationIsMissing(appHasMinimums: boolean): void {
  if (!__DEV__ || missingExpoApplicationWarned || !appHasMinimums || isExpoApplicationInstalled()) {
    return;
  }
  missingExpoApplicationWarned = true;
  console.warn(
    'Clerk: This instance sets minimum app versions, but Clerk cannot read your app version without expo-application, so it will not block outdated versions.\nInstall it with: npx expo install expo-application',
  );
}

function supportedStatus(): AppVersionSupportStatus {
  return {
    isSupported: true,
    currentVersion: getNativeAppIdentity()?.version ?? null,
    minimumVersion: null,
    updateUrl: null,
  };
}

function rejectionStatus(meta: Record<string, unknown>): AppVersionSupportStatus {
  return {
    isSupported: false,
    currentVersion: stringOrNull(meta.current_version) ?? getNativeAppIdentity()?.version ?? null,
    minimumVersion: stringOrNull(meta.minimum_version) ?? environmentStatus?.minimumVersion ?? null,
    updateUrl: httpUrlOrNull(meta.update_url) ?? environmentStatus?.updateUrl ?? null,
  };
}

function publish({
  displayChanged = false,
  notifyLater = false,
}: { displayChanged?: boolean; notifyLater?: boolean } = {}): void {
  const next = !serverAnswer
    ? (environmentStatus ?? supportedStatus())
    : !serverAnswer.isSupported
      ? rejectionStatus(serverAnswer.meta)
      : environmentStatus?.isSupported
        ? environmentStatus
        : supportedStatus();
  const statusChanged = !sameStatus(next, status);
  if (statusChanged) {
    status = next;
  }
  if (statusChanged || displayChanged) {
    if (notifyLater) {
      queueMicrotask(notifyListeners);
    } else {
      notifyListeners();
    }
  }
}

function notifyListeners(): void {
  listeners.forEach(listener => listener());
}

function resolveDisplay(environment: unknown): UpdateRequiredDisplay {
  const displayConfig = isRecord(environment) ? environment.display_config : undefined;
  if (!isRecord(displayConfig)) {
    return display;
  }
  return {
    applicationName: stringOrNull(displayConfig.application_name),
    logoImageUrl: httpUrlOrNull(displayConfig.logo_image_url),
    supportEmail: stringOrNull(displayConfig.support_email),
  };
}

function sameDisplay(a: UpdateRequiredDisplay, b: UpdateRequiredDisplay): boolean {
  return (
    a.applicationName === b.applicationName && a.logoImageUrl === b.logoImageUrl && a.supportEmail === b.supportEmail
  );
}

function sameStatus(a: AppVersionSupportStatus, b: AppVersionSupportStatus): boolean {
  return (
    a.isSupported === b.isSupported &&
    a.currentVersion === b.currentVersion &&
    a.minimumVersion === b.minimumVersion &&
    a.updateUrl === b.updateUrl
  );
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
