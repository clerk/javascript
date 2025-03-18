import * as SecureStore from 'expo-secure-store';

import type { TokenCache } from '../cache';
import { isNative } from '../utils';

/**
 * Create a token cache using Expo's SecureStore
 */
const createTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        const item = await SecureStore.getItemAsync(key);
        return item;
      } catch {
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },
    saveToken: (key: string, token: string) => {
      return SecureStore.setItemAsync(key, token);
    },
  };
};

/**
 * Secure token cache implementation for Expo apps.
 *
 * Clerk stores the active user's session token in memory by default. In Expo apps, the
 * recommended way to store sensitive data, such as tokens, is by using `expo-secure-store`
 * which encrypts the data before storing it.
 *
 * To implement your own token cache, create an object that implements the `TokenCache` interface:
 * - `getToken(key: string): Promise<string | null>`
 * - `saveToken(key: string, token: string): Promise<void>`
 *
 * @type {TokenCache | undefined} Object with `getToken` and `saveToken` methods, undefined on web
 */
export const tokenCache = isNative() ? createTokenCache() : undefined;
