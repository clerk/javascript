import { Clerk } from '@clerk/clerk-js/no-rhc';
import { DEV_BROWSER_JWT_KEY } from '@clerk/shared/devBrowser';
import { parsePublishableKey } from '@clerk/shared/keys';
import browser from 'webextension-polyfill';

import { SCOPE, type Scope } from '../types';
import { CLIENT_JWT_KEY, DEFAULT_LOCAL_HOST_PERMISSION } from './constants';
import { assertPublishableKey } from './utils/errors';
import type { JWTHandlerParams } from './utils/jwt-handler';
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
  __experimental_syncHostListener?: boolean;
  publishableKey: string;
  scope?: Scope;
  storageCache?: StorageCache;
  syncHost?: string;
};

export function createClerkClient({
  __experimental_syncHostListener = false,
  publishableKey,
  scope,
  storageCache = BrowserStorageCache,
  syncHost,
}: CreateClerkClientOptions) {
  if (scope === SCOPE.BACKGROUND) {
    // TODO @nikos
    Clerk.mountComponentRenderer = undefined;
  }

  // Don't cache background scripts as it can result in out-of-sync client information.
  if (clerk && scope !== SCOPE.BACKGROUND) {
    return clerk;
  }

  // Sync is enabled if a `syncHost` is provided
  const sync = Boolean(syncHost);

  // Parse publishableKey and assert it's present/valid, throw if not
  const key = parsePublishableKey(publishableKey);
  assertPublishableKey(key);

  const isProd = key.instanceType === 'production';
  const manifest = browser.runtime.getManifest();

  // Will throw if manifest is invalid
  validateManifest(manifest, {
    background: scope === SCOPE.BACKGROUND,
    sync,
  });

  // Set up JWT handler and attempt to get JWT from storage on initialization
  const url = syncHost ? syncHost : DEFAULT_LOCAL_HOST_PERMISSION;

  // Create Clerk instance
  clerk = new Clerk(publishableKey, {});

  // @ts-expect-error - TODO: sync is evaluating to true vs boolean
  const jwtOptions: JWTHandlerParams = {
    frontendApi: key.frontendApi,
    name: isProd ? CLIENT_JWT_KEY : DEV_BROWSER_JWT_KEY,
    url,
    sync: sync,
  };

  if (jwtOptions.sync && __experimental_syncHostListener) {
    jwtOptions.onListenerCallback = () => {
      if (clerk.user) {
        clerk.user.reload();
      } else {
        window.location.reload();
      }
    };
  }

  const jwt = JWTHandler(storageCache, jwtOptions);

  // Add listener to sync host cookies if enabled
  if (jwtOptions.sync && __experimental_syncHostListener) {
    const listener = jwt.listener();
    listener?.add();
  }

  clerk.__internal_onAfterResponse(responseHandler(jwt, { isProd }));
  clerk.__internal_onBeforeRequest(requestHandler(jwt, { isProd }));

  return clerk;
}
