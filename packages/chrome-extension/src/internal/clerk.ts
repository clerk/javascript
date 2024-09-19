import { Clerk } from '@clerk/clerk-js';
import { DEV_BROWSER_JWT_KEY } from '@clerk/shared/devBrowser';
import { parsePublishableKey } from '@clerk/shared/keys';
import browser from 'webextension-polyfill';

import { SCOPE, type Scope } from '../types';
import { CLIENT_JWT_KEY, DEFAULT_LOCAL_HOST_PERMISSION } from './constants';
import { assertPublishableKey } from './utils/errors';
import { JWTHandler } from './utils/jwt-handler';
import { validateManifest } from './utils/manifest';
import { requestHandler } from './utils/request-handler';
import { responseHandler } from './utils/response-handler';
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
  syncHost?: string;
  syncSessionWithTab?: boolean;
};

export async function createClerkClient({
  publishableKey,
  scope,
  storageCache = BrowserStorageCache,
  syncHost = process.env.CLERK_SYNC_HOST,
  syncSessionWithTab = false,
}: CreateClerkClientOptions): Promise<Clerk> {
  console.log('createClerkClient (props):', { publishableKey, scope, storageCache, syncHost, syncSessionWithTab });

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
    background: scope === SCOPE.background,
    sync: syncSessionWithTab,
  });

  // Set up JWT handler and attempt to get JWT from storage on initialization

  const jwtOptions = {
    frontendApi: key.frontendApi,
    name: isProd ? CLIENT_JWT_KEY : DEV_BROWSER_JWT_KEY,
    sync: syncSessionWithTab,
    url: syncHost || isProd ? `https://${key.frontendApi}` : DEFAULT_LOCAL_HOST_PERMISSION,
  };

  console.log('JWTHandler (options):', jwtOptions);
  const jwt = JWTHandler(storageCache, jwtOptions);

  // Create Clerk instance
  clerk = new Clerk(publishableKey);
  clerk.__unstable__onAfterResponse(requestHandler(jwt));
  clerk.__unstable__onAfterResponse(responseHandler(jwt));

  return clerk;
}
