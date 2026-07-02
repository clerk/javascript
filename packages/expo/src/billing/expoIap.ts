import { IAPBillingError } from './errors';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- type-only annotation for optional dependency
export type ExpoIapModule = typeof import('expo-iap');

let cachedModule: ExpoIapModule | undefined;
let connectionPromise: Promise<unknown> | null = null;

/**
 * Loads the optional `expo-iap` module.
 *
 * Load via synchronous require() instead of import(): Metro inlines require() into the main
 * bundle, while import() emits an async chunk that fails to resolve without @expo/metro-runtime.
 *
 * @internal
 */
export function loadExpoIap(): ExpoIapModule {
  if (cachedModule) {
    return cachedModule;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require('expo-iap') as ExpoIapModule;
  } catch (err) {
    throw new IAPBillingError(
      'expo_iap_unavailable',
      `Unable to load expo-iap, which is required for in-app purchase billing: ${
        err instanceof Error ? err.message : 'Unknown error'
      }. If it is not installed, run: npx expo install expo-iap`,
      { cause: err },
    );
  }

  return cachedModule;
}

/**
 * Initializes the store billing connection once per app session. `expo-iap` requires `initConnection()` before any
 * other IAP API call. The connection is intentionally never closed: multiple consumers (hook instances, listeners)
 * may rely on it for the lifetime of the app.
 *
 * @internal
 */
export function ensureIapConnection(iap: ExpoIapModule): Promise<unknown> {
  if (!connectionPromise) {
    connectionPromise = iap.initConnection().catch((err: unknown) => {
      connectionPromise = null;
      throw err;
    });
  }
  return connectionPromise;
}
