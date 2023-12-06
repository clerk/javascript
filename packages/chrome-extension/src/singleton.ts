import { Clerk } from '@clerk/clerk-js';
import type { ClerkProp } from '@clerk/clerk-react';
import { CLIENT_JWT_KEY, DEV_BROWSER_JWT_MARKER } from '@clerk/shared';
import browser from 'webextension-polyfill';

import { STORAGE_KEY_CLIENT_JWT } from './constants';
import { logErrorHandler } from './errors';
import { getClientCookie } from './utils/cookies';
import { BrowserStorageCache, type StorageCache } from './utils/storage';
import { parseAndValidatePublishableKey, validateManifest } from './utils/validation';

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

  // Will throw if publishableKey is invalid
  const { frontendApi, instanceType } = parseAndValidatePublishableKey(publishableKey);

  const isProd = instanceType === 'production';

  // Get client cookie from browser
  const clientCookie = await (isProd
    ? getClientCookie(frontendApi, CLIENT_JWT_KEY)
    : getClientCookie(syncSessionHost, DEV_BROWSER_JWT_MARKER)
  ).catch(logErrorHandler);

  // Create StorageCache key
  const CACHE_KEY = storageCache.createKey(isProd ? frontendApi : syncSessionHost, STORAGE_KEY_CLIENT_JWT);

  if (clientCookie) {
    await storageCache.set(CACHE_KEY, clientCookie.value).catch(logErrorHandler);
  }

  clerk = new Clerk(publishableKey);

  // @ts-expect-error - Clerk doesn't expose this unstable method publicly
  clerk.__unstable__onBeforeRequest(async requestInit => {
    requestInit.credentials = 'omit';
    requestInit.url?.searchParams.append('_is_native', '1');

    const jwt = await storageCache.get(CACHE_KEY);

    (requestInit.headers as Headers).set('authorization', jwt || '');
  });

  // @ts-expect-error - Clerk doesn't expose this unstable method publicly
  clerk.__unstable__onAfterResponse(async (_, response) => {
    const authHeader = response.headers.get('authorization');

    if (authHeader) {
      await storageCache.set(CACHE_KEY, authHeader);
    }
  });

  return clerk;
}
