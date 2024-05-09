import { Clerk } from '@clerk/clerk-js';
import type { ClerkProp } from '@clerk/clerk-react';
import { DEV_BROWSER_JWT_KEY } from '@clerk/shared';
import { parsePublishableKey } from '@clerk/shared/keys';
import browser from 'webextension-polyfill';

import { CLIENT_JWT_KEY, DEFAULT_LOCAL_HOST_PERMISSION, STORAGE_KEY_CLIENT_JWT } from './constants';
import type { GetClientCookieParams } from './utils/cookies';
import { getClientCookie } from './utils/cookies';
import { assertPublishableKey, errorLogger } from './utils/errors';
import { getValidPossibleManifestHosts, validateHostPermissionExistence, validateManifest } from './utils/manifest';
import { BrowserStorageCache, type StorageCache } from './utils/storage';

export let clerk: ClerkProp;

type BuildClerkOptions = {
  publishableKey: string;
  storageCache?: StorageCache;
};

export async function buildClerk({
  publishableKey,
  storageCache = BrowserStorageCache,
}: BuildClerkOptions): Promise<ClerkProp> {
  if (clerk) {
    return clerk;
  }

  // Parse publishableKey and assert it's present/valid, throw if not
  const key = parsePublishableKey(publishableKey);
  assertPublishableKey(key);

  const isProd = key.instanceType === 'production';
  const hostHint = isProd ? key.frontendApi : DEFAULT_LOCAL_HOST_PERMISSION;
  const manifest = browser.runtime.getManifest();

  // Will throw if manifest is invalid
  validateManifest(manifest);

  const validHosts = getValidPossibleManifestHosts(manifest);

  // Will throw if manifest host_permissions doesn't contain a valid host
  validateHostPermissionExistence(validHosts, hostHint);

  // Set up cookie params based on environment
  const getClientCookieParams: GetClientCookieParams = isProd
    ? {
        urls: key.frontendApi,
        name: CLIENT_JWT_KEY,
      }
    : {
        urls: validHosts,
        name: DEV_BROWSER_JWT_KEY,
      };

  // Get client cookie from browser
  const clientCookie = await getClientCookie(getClientCookieParams).catch(errorLogger);

  // Create StorageCache key
  const CACHE_KEY = storageCache.createKey(key.frontendApi, STORAGE_KEY_CLIENT_JWT);

  // Set client cookie in StorageCache
  if (clientCookie) {
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

    if (requestInit.method !== 'GET') {
      (requestInit.headers as Headers).delete('origin');
    }
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
