import { useSyncExternalStore } from 'react';

import type { AppVersionSupportStatus } from '../app-version/appVersionSupport';
import { getAppVersionSupportStatus, subscribeToAppVersionSupport } from '../app-version/appVersionSupport';

export type { AppVersionSupportStatus } from '../app-version/appVersionSupport';

/**
 * Returns whether this build of your app meets the minimum version set for it in the Clerk Dashboard, and updates when that changes.
 *
 * When the version is unsupported, Clerk rejects the app's requests until the user updates. Read `updateUrl` to send them to the store.
 *
 * Clerk reads the app's version with `expo-application`. Without it, or in Expo Go, the app is always reported as supported.
 *
 * @example
 * ```tsx
 * const { isSupported, updateUrl } = useAppVersionSupport();
 * if (!isSupported) {
 *   return <UpdateScreen storeUrl={updateUrl} />;
 * }
 * ```
 */
export function useAppVersionSupport(): AppVersionSupportStatus {
  return useSyncExternalStore(subscribeToAppVersionSupport, getAppVersionSupportStatus, getAppVersionSupportStatus);
}
