import type { ClerkClient } from '@clerk/backend';
import { createClerkClient } from '@clerk/backend';
import { constants } from '@clerk/backend/internal';
import { deprecated } from '@clerk/shared/deprecated';

import { buildRequestLike } from '../app-router/server/utils';
import { clerkMiddlewareRequestDataStore } from './clerkMiddleware';
import {
  API_URL,
  API_VERSION,
  DOMAIN,
  IS_SATELLITE,
  PROXY_URL,
  PUBLISHABLE_KEY,
  SDK_METADATA,
  SECRET_KEY,
  TELEMETRY_DEBUG,
  TELEMETRY_DISABLED,
} from './constants';
import { decryptClerkRequestData, getHeader } from './utils';

const clerkClientDefaultOptions = {
  secretKey: SECRET_KEY,
  publishableKey: PUBLISHABLE_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
  proxyUrl: PROXY_URL,
  domain: DOMAIN,
  isSatellite: IS_SATELLITE,
  sdkMetadata: SDK_METADATA,
  telemetry: {
    disabled: TELEMETRY_DISABLED,
    debug: TELEMETRY_DEBUG,
  },
};

const createClerkClientWithOptions: typeof createClerkClient = options =>
  createClerkClient({ ...clerkClientDefaultOptions, ...options });

/**
 * @deprecated
 * This singleton is deprecated and will be removed in a future release. Please use `clerkClient()` as a function instead.
 */
const clerkClientSingleton = createClerkClient(clerkClientDefaultOptions);

/**
 * Constructs a BAPI client that accesses request data within the runtime.
 * Necessary if middleware dynamic keys are used.
 */
const clerkClientForRequest = () => {
  let requestData;

  const middlewareStore = clerkMiddlewareRequestDataStore.getStore();
  if (Object.values(middlewareStore ?? {}).length) {
    requestData = middlewareStore;
  } else {
    // When outside of middleware runtime, fallbacks to access request data from `NextRequest`
    const request = buildRequestLike();
    const encryptedRequestData = getHeader(request, constants.Headers.ClerkRequestData);
    requestData = decryptClerkRequestData(encryptedRequestData);
  }

  if (requestData?.secretKey || requestData?.publishableKey) {
    return createClerkClientWithOptions({
      secretKey: requestData.secretKey,
      publishableKey: requestData.publishableKey,
    });
  }

  return clerkClientSingleton;
};

interface ClerkClientExport extends ClerkClient {
  (): ClerkClient;
}

// TODO SDK-1839 - Remove `clerkClient` singleton in the next major version of `@clerk/nextjs`
const clerkClient = new Proxy(Object.assign(clerkClientForRequest, clerkClientSingleton), {
  get(target, prop: string, receiver) {
    deprecated('clerkClient singleton', 'Use `clerkClient()` as a function instead.');

    return Reflect.get(target, prop, receiver);
  },
}) as ClerkClientExport;

export { clerkClient };
