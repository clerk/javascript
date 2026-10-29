import type { AndroidMinimumVersionJSON, EnvironmentJSON, IOSMinimumVersionJSON } from '@clerk/shared/types';

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
   * This build's version, as Clerk compares it with the minimum: its `CFBundleShortVersionString` on iOS, such as `4.2.1`, and its `versionCode` on Android, such as `42`. On Android, this isn't the version name that users see, such as `4.2.1`. `null` when it can't be read, such as in Expo Go or without `expo-application`.
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

// The environment comes from the network, so each field is still checked before it's used.
type EnvironmentResponse = Partial<Pick<EnvironmentJSON, 'display_config' | 'native_app_settings'>>;

type MinimumVersionJSON = IOSMinimumVersionJSON | AndroidMinimumVersionJSON;

type ServerAnswer = { isSupported: true } | { isSupported: false; meta: Record<string, unknown> };

const IOS_VERSION = /^\d+(\.\d+){0,2}$/;
const ANDROID_VERSION_CODE = /^[1-9]\d*$/;

const listeners = new Set<() => void>();
const state = {
  requestSequence: 0,
  lastResetRequest: 0,
  lastAnsweredRequest: 0,
  // What the last fetched environment says about this app.
  environmentStatus: null as AppVersionSupportStatus | null,
  // What the last answered request says: a rejection, or a header saying the app is supported.
  serverAnswer: null as ServerAnswer | null,
  status: supportedStatus(),
  display: EMPTY_DISPLAY,
};
let missingExpoApplicationWarned = false;

export function subscribeToAppVersionSupport(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAppVersionSupportStatus(): AppVersionSupportStatus {
  return state.status;
}

export function getUpdateRequiredDisplay(): UpdateRequiredDisplay {
  return state.display;
}

export function nextAppVersionRequest(): number {
  state.requestSequence += 1;
  return state.requestSequence;
}

export function resetAppVersionSupport(): void {
  state.lastResetRequest = state.requestSequence;
  state.lastAnsweredRequest = state.requestSequence;
  state.environmentStatus = null;
  state.serverAnswer = null;
  state.display = EMPTY_DISPLAY;
  publish({ displayChanged: true, notifyLater: true });
}

export function applyFetchedEnvironment(environment: unknown, request: number): void {
  if (request <= state.lastResetRequest) {
    return;
  }
  const json = isRecord(environment) ? (environment as EnvironmentResponse) : null;
  state.environmentStatus = resolveEnvironmentStatus(json);
  const nextDisplay = resolveDisplay(json);
  const displayChanged = !sameDisplay(nextDisplay, state.display);
  if (displayChanged) {
    state.display = nextDisplay;
  }
  publish({ displayChanged });
}

export function applyUnsupportedAppVersion(meta: unknown, request: number): void {
  if (!acceptAnswer(request)) {
    return;
  }
  state.serverAnswer = { isSupported: false, meta: isRecord(meta) ? meta : {} };
  publish();
}

export function applySupportedAppVersion(request: number): void {
  if (!acceptAnswer(request)) {
    return;
  }
  state.serverAnswer = { isSupported: true };
  publish();
}

function acceptAnswer(request: number): boolean {
  if (request <= state.lastAnsweredRequest) {
    return false;
  }
  state.lastAnsweredRequest = request;
  return true;
}

function resolveEnvironmentStatus(environment: EnvironmentResponse | null): AppVersionSupportStatus {
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

function minimumVersionsForPlatform(
  environment: EnvironmentResponse | null,
  platform: NativeAppPlatform | null,
): MinimumVersionJSON[] {
  const settings = environment?.native_app_settings;
  const minimums = isRecord(settings) ? settings.minimum_supported_version : undefined;
  const entries: MinimumVersionJSON[] | undefined = platform && isRecord(minimums) ? minimums[platform] : undefined;
  return Array.isArray(entries) ? entries.filter(isRecord) : [];
}

function appIdentifier(entry: MinimumVersionJSON, platform: NativeAppPlatform): string | null {
  if (platform === 'ios') {
    return 'bundle_id' in entry ? stringOrNull(entry.bundle_id) : null;
  }
  return 'package_name' in entry ? stringOrNull(entry.package_name) : null;
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
    'Clerk: This instance sets minimum app versions, but Clerk cannot read your app version without expo-application. Until you install it, useAppVersionSupport() always reports the app as supported, requests from JavaScript are not blocked, and <ClerkProvider> shows no update screen. Clerk native components still block outdated versions and show their own screen.\nInstall it with: npx expo install expo-application',
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

function rejectionStatus(
  meta: Record<string, unknown>,
  environmentStatus: AppVersionSupportStatus | null,
): AppVersionSupportStatus {
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
  const next = deriveStatus(state);
  const statusChanged = !sameStatus(next, state.status);
  if (statusChanged) {
    state.status = next;
  }
  if (statusChanged || displayChanged) {
    if (notifyLater) {
      queueMicrotask(notifyListeners);
    } else {
      notifyListeners();
    }
  }
}

// A rejection wins. A response saying the app is supported overrides an environment that says it isn't, because the
// server is what enforces the minimum.
function deriveStatus({
  environmentStatus,
  serverAnswer,
}: Pick<typeof state, 'environmentStatus' | 'serverAnswer'>): AppVersionSupportStatus {
  if (!serverAnswer) {
    return environmentStatus ?? supportedStatus();
  }
  if (!serverAnswer.isSupported) {
    return rejectionStatus(serverAnswer.meta, environmentStatus);
  }
  return environmentStatus?.isSupported ? environmentStatus : supportedStatus();
}

function notifyListeners(): void {
  listeners.forEach(listener => listener());
}

function resolveDisplay(environment: EnvironmentResponse | null): UpdateRequiredDisplay {
  const displayConfig = environment?.display_config;
  if (!isRecord(displayConfig)) {
    return state.display;
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
