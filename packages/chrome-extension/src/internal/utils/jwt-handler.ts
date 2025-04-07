import { CLIENT_UAT_KEY, STORAGE_KEY_CLIENT_JWT } from '../constants';
import type { ChangeInfo, GetClientCookieParams } from './cookies';
import { createClientCookieListener, getClientCookie } from './cookies';
import { errorLogger } from './errors';
import type { StorageCache } from './storage';

export type JWTHandlerParams = { frontendApi: string } & (
  | {
      sync?: false;
    }
  | ({ sync: true } & GetClientCookieParams)
);

export type JWTHandler = ReturnType<typeof JWTHandler>;

function shouldSync(sync: boolean | undefined, _params: unknown): _params is GetClientCookieParams {
  return Boolean(sync);
}

export function JWTHandler(store: StorageCache, params: JWTHandlerParams) {
  const { sync, frontendApi, ...cookieParams } = params;

  const CACHE_KEY = store.createKey(frontendApi, STORAGE_KEY_CLIENT_JWT, 'v2');

  /**
   * Sets the JWT value to the active
   * @param value: JWT generally from the cookie or authorization header
   */
  const set = async (value: string): Promise<void> => {
    return await store.set(CACHE_KEY, value).catch(errorLogger);
  };

  /**
   * Remove the JWT value
   */
  const remove = async (): Promise<void> => {
    return await store.remove(CACHE_KEY).catch(errorLogger);
  };

  /**
   * Gets the JWT value to the active store.
   * If not set, attempt to get it from the synced session and save for later use.
   */
  const get = async () => {
    if (shouldSync(sync, cookieParams)) {
      // Get client cookie from browser
      const syncedJWT = await getClientCookie(cookieParams).catch(errorLogger);

      if (syncedJWT) {
        // Set client cookie in StorageCache
        await set(syncedJWT.value);
        return syncedJWT.value;
      }
    }

    // Get current JWT from StorageCache
    return await store.get<string>(CACHE_KEY);
  };

  const listener = () => {
    if (!shouldSync(sync, cookieParams)) {
      return;
    }

    const { onListenerCallback, ...restCookieParams } = cookieParams;

    return createClientCookieListener({
      ...restCookieParams,
      callback: async (changeInfo: ChangeInfo) => {
        const existingJWT = await get();

        if (existingJWT === changeInfo.cookie.value) {
          const syncedUAT = await getClientCookie({ ...restCookieParams, name: CLIENT_UAT_KEY }).catch(errorLogger);

          if (!syncedUAT || syncedUAT?.value === '0') {
            onListenerCallback?.();
          }

          return;
        }

        await set(changeInfo.cookie.value);
        onListenerCallback?.();
      },
    });
  };

  return { get, listener, set, remove };
}
