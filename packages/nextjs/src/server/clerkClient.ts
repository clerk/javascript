import type { ClerkClient } from '@clerk/backend';
import { createClerkClient } from '@clerk/backend';
import { constants } from '@clerk/backend/internal';
import { deprecated } from '@clerk/shared';

import { buildRequestLike } from '../app-router/server/utils';
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

const clerkClientSingleton = createClerkClient(clerkClientDefaultOptions);

/**
 * @deprecated
 * This object is deprecated and will be removed in a future release. Please use `clerkClient()` as a function instead.
 */
const clerkClientSingletonProxy = new Proxy(clerkClientSingleton, {
  get(target, prop, receiver) {
    deprecated('clerkClient object', 'Use `clerkClient()` as a function instead.');

    return Reflect.get(target, prop, receiver);
  },
});

/**
 * Constructs a BAPI client with keys passed dynamically to a request.
 * Necessary if middleware dynamic keys are used.
 */
const clerkClientForRequest = () => {
  const request = buildRequestLike();
  const encryptedRequestData = getHeader(request, constants.Headers.ClerkRequestData);
  const decryptedRequestData = decryptClerkRequestData(encryptedRequestData);

  if (decryptedRequestData.secretKey || decryptedRequestData.publishableKey) {
    return createClerkClientWithOptions({
      secretKey: decryptedRequestData.secretKey,
      publishableKey: decryptedRequestData.publishableKey,
    });
  }

  return clerkClient;
};

const clerkClient: ClerkClient & typeof clerkClientForRequest = Object.assign(
  clerkClientForRequest,
  // TODO SDK-1839 - Remove `clerkClient` singleton in the next major version of `@clerk/nextjs`
  clerkClientSingletonProxy,
);

export { clerkClient };
