import { IAPBillingError } from './errors';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- type-only annotation for optional dependency
export type ExpoCryptoModule = typeof import('expo-crypto');

/**
 * Loads the `expo-crypto` module, which is required to derive the store user-binding tokens.
 *
 * Load via synchronous require() instead of import(): Metro inlines require() into the main
 * bundle, while import() emits an async chunk that fails to resolve without @expo/metro-runtime.
 *
 * @internal
 */
export function loadExpoCrypto(): ExpoCryptoModule {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-crypto') as ExpoCryptoModule;
  } catch (err) {
    throw new IAPBillingError(
      'expo_crypto_unavailable',
      `Unable to load expo-crypto, which is required to bind store purchases to the signed-in user: ${
        err instanceof Error ? err.message : 'Unknown error'
      }. If it is not installed, run: npx expo install expo-crypto`,
      { cause: err },
    );
  }
}
