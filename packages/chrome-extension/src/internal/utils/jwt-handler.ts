import { Poller } from '@clerk/shared/poller';

import { STORAGE_KEY_CLIENT_JWT } from '../constants';
import type { GetClientCookieParams } from './cookies';
import { getClientCookie } from './cookies';
import { errorLogger } from './errors';
import type { StorageCache } from './storage';

type JWTHandlerParams = { frontendApi: string } & (
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

    const value = await store.get<string>(CACHE_KEY);

    // Get current JWT from StorageCache
    return value;
  };

  /**
   * Polls for the synced session JWT via the get() function.
   *
   * @param delayInMs: Polling delay in milliseconds (default: 1500ms)
   */
  const poll = async (delayInMs = 1500) => {
    const { run, stop } = Poller({ delayInMs });

    void run(async () => {
      const currentJWT = await get();

      if (currentJWT) {
        stop();
      }
    });
  };

  return { get, poll, set, remove };
}
