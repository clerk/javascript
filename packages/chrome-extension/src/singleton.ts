import { Clerk } from '@clerk/clerk-js';
import type { ClerkProp } from '@clerk/clerk-react';
import { DEV_BROWSER_JWT_KEY } from '@clerk/shared';
import { parsePublishableKey } from '@clerk/shared/keys';
import browser from 'webextension-polyfill';

import { AUTH_HEADER, CLIENT_JWT_KEY, DEFAULT_LOCAL_HOST_PERMISSION } from './constants';
import type { GetClientCookieParams } from './utils/cookies';
import { assertPublishableKey } from './utils/errors';
import { JWTHandler } from './utils/jwt-handler';
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
        urls: `https://${key.frontendApi}`,
        name: CLIENT_JWT_KEY,
      }
    : {
        urls: validHosts,
        name: DEV_BROWSER_JWT_KEY,
      };

  // Set up JWT handler and attempt to get JWT from storage on initialization
  const jwt = JWTHandler(storageCache, { ...getClientCookieParams, frontendApi: key.frontendApi });
  void jwt.poll();

  // Create Clerk instance
  clerk = new Clerk(publishableKey);

  // Append appropriate query params to all Clerk requests
  // @ts-expect-error - Clerk doesn't expose this unstable method publicly
  clerk.__unstable__onBeforeRequest(async requestInit => {
    requestInit.credentials = 'omit';

    const currentJWT = await jwt.get();

    if (isProd) {
      requestInit.url?.searchParams.append('_is_native', '1');
      (requestInit.headers as Headers).set('authorization', currentJWT || '');
    } else {
      requestInit.url?.searchParams.append('__clerk_db_jwt', currentJWT);
    }
  });

  // Store updated JWT in StorageCache on Clerk responses
  // @ts-expect-error - Clerk doesn't expose this unstable method publicly
  clerk.__unstable__onAfterResponse(async (_, response) => {
    const authHeaderkey = isProd ? AUTH_HEADER.production : AUTH_HEADER.development;
    const authHeader = response.headers.get(authHeaderkey);

    if (authHeader) {
      await jwt.set(authHeader);
    }
  });

  return clerk;
}
