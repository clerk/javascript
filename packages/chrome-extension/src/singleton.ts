import { Clerk } from '@clerk/clerk-js';
import type { ClerkProp } from '@clerk/clerk-react';
import { DEV_BROWSER_JWT_MARKER } from '@clerk/shared';
import { parsePublishableKey } from '@clerk/shared/keys';
import browser from 'webextension-polyfill';

import { CLIENT_JWT_KEY, STORAGE_KEY_CLIENT_JWT } from './constants';
import { getClientCookie } from './utils/cookies';
import { assertPublishableKey, errorLogger } from './utils/errors';
import { BrowserStorageCache, type StorageCache } from './utils/storage';
import { validateManifest } from './utils/validation';

export let clerk: ClerkProp;

type BuildClerkOptions = {
  publishableKey: string;
  storageCache?: StorageCache;
  syncSessionHost?: string;
};

export async function buildClerk({
  publishableKey,
  storageCache = BrowserStorageCache,
  syncSessionHost = 'http://localhost',
}: BuildClerkOptions): Promise<ClerkProp> {
  if (clerk) {
    return clerk;
  }

  // Will throw if manifest is invalid
  validateManifest(browser.runtime.getManifest());

  // Parse publishableKey and assert it's present/valid
  const key = parsePublishableKey(publishableKey);
  assertPublishableKey(key);

  // Will throw if publishableKey is invalid
  const isProd = key.instanceType === 'production';

  // Get client cookie from browser
  const clientCookie = await (isProd
    ? getClientCookie(key.frontendApi, CLIENT_JWT_KEY)
    : getClientCookie(syncSessionHost, DEV_BROWSER_JWT_MARKER)
  ).catch(errorLogger);

  // Create StorageCache key
  const CACHE_KEY = storageCache.createKey(isProd ? key.frontendApi : syncSessionHost, STORAGE_KEY_CLIENT_JWT);

  if (clientCookie) {
    // Set client cookie in StorageCache
    await storageCache.set(CACHE_KEY, clientCookie.value).catch(errorLogger);
  }

  // Create Clerk instance
  clerk = new Clerk(publishableKey);

  // Append appropriate query params to all Clerk requests
  // @ts-expect-error - Clerk doesn't expose this unstable method publicly
  clerk.__unstable__onBeforeRequest(async requestInit => {
    requestInit.credentials = 'omit';
    requestInit.url?.searchParams.append('_is_native', '1');

    const jwt = await storageCache.get(CACHE_KEY);

    (requestInit.headers as Headers).set('authorization', jwt || '');
  });

  // Store updated JWT in StorageCache on Clerk responses
  // @ts-expect-error - Clerk doesn't expose this unstable method publicly
  clerk.__unstable__onAfterResponse(async (_, response) => {
    const authHeader = response.headers.get('authorization');

    if (authHeader) {
      await storageCache.set(CACHE_KEY, authHeader);
    }
  });

  return clerk;
}
