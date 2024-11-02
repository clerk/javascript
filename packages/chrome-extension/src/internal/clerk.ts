import { Clerk } from '@clerk/clerk-js';
import { DEV_BROWSER_JWT_KEY } from '@clerk/shared/devBrowser';
import { parsePublishableKey } from '@clerk/shared/keys';
import browser from 'webextension-polyfill';

import { SCOPE, type Scope } from '../types';
import { AUTH_HEADER, CLIENT_JWT_KEY, DEFAULT_LOCAL_HOST_PERMISSION } from './constants';
import type { GetClientCookieParams } from './utils/cookies';
import { assertPublishableKey } from './utils/errors';
import { JWTHandler } from './utils/jwt-handler';
import { getValidPossibleManifestHosts, validateHostPermissionExistence, validateManifest } from './utils/manifest';
import { BrowserStorageCache, type StorageCache } from './utils/storage';

export let clerk: Clerk;

Clerk.sdkMetadata = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

export type CreateClerkClientOptions = {
  publishableKey: string;
  scope?: Scope;
  storageCache?: StorageCache;
  syncSessionWithTab?: boolean;
};

export async function createClerkClient({
  publishableKey,
  scope,
  storageCache = BrowserStorageCache,
  syncSessionWithTab = false,
}: CreateClerkClientOptions): Promise<Clerk> {
  if (clerk) {
    return clerk;
  }

  // Parse publishableKey and assert it's present/valid, throw if not
  const key = parsePublishableKey(publishableKey);
  assertPublishableKey(key);

  const isProd = key.instanceType === 'production';
  const manifest = browser.runtime.getManifest();

  // Will throw if manifest is invalid
  validateManifest(manifest, {
    sync: syncSessionWithTab,
    background: scope === SCOPE.background,
  });

  let jwt: JWTHandler | undefined;

  if (syncSessionWithTab) {
    const hostHint = isProd ? key.frontendApi : DEFAULT_LOCAL_HOST_PERMISSION;
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
    jwt = JWTHandler(storageCache, { ...getClientCookieParams, frontendApi: key.frontendApi, sync: true });
  } else {
    jwt = JWTHandler(storageCache, { frontendApi: key.frontendApi, sync: false });
  }

  if (!jwt) {
    throw new Error('StorageCache could not be initialized.'); // TODO: Update error
  }

  // Create Clerk instance
  clerk = new Clerk(publishableKey);

  // Append appropriate query params to all Clerk requests
  clerk.__unstable__onBeforeRequest(async requestInit => {
    requestInit.credentials = 'omit';

    const currentJWT = await jwt.get();

    if (!currentJWT) {
      requestInit.url?.searchParams.append('_is_native', '1');
      return;
    }

    if (isProd) {
      requestInit.url?.searchParams.append('_is_native', '1');
      (requestInit.headers as Headers).set('authorization', `Bearer ${currentJWT}`);
    } else {
      requestInit.url?.searchParams.append('__clerk_db_jwt', currentJWT);
    }
  });

  // Store updated JWT in StorageCache on Clerk responses
  clerk.__unstable__onAfterResponse(async (_, response) => {
    const authHeaderkey = isProd ? AUTH_HEADER.production : AUTH_HEADER.development;
    const authHeader = response?.headers.get(authHeaderkey);

    if (authHeader?.startsWith('Bearer')) {
      const newJWT = authHeader.split(' ')[1] || undefined;

      if (newJWT) {
        await jwt.set(newJWT);
      } else {
        await jwt.remove();
      }
    } else if (authHeader) {
      await jwt.set(authHeader);
    }
  });

  return clerk;
}
