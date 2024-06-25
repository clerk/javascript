import type { ClerkClient } from '@clerk/backend';
import { createClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions } from '@clerk/backend/internal';
import { constants } from '@clerk/backend/internal';
import { deprecated } from '@clerk/shared/deprecated';

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

export const clerkClientStorage = new AsyncLocalStorage<Partial<AuthenticateRequestOptions>>();

const createClerkClientWithOptions: typeof createClerkClient = options =>
  createClerkClient({ ...clerkClientDefaultOptions, ...options });

const clerkClientSingleton = createClerkClient(clerkClientDefaultOptions);

/**
 * @deprecated
 * This singleton is deprecated and will be removed in a future release. Please use `clerkClient()` as a function instead.
 */
const clerkClientSingletonProxy = new Proxy(clerkClientSingleton, {
  get(target, prop, receiver) {
    if (Object.getPrototypeOf(target) === Object.getPrototypeOf(clerkClientSingleton)) {
      deprecated('clerkClient object', 'Use `clerkClient()` as a function instead.');
    }

    return Reflect.get(target, prop, receiver);
  },
});

/**
 * Constructs a BAPI client that accesses request data within the runtime.
 * Necessary if middleware dynamic keys are used.
 */
const clerkClientForRequest = () => {
  let requestData: Partial<AuthenticateRequestOptions> | undefined;

  /**
   * For BAPI client usage inside middleware runtime, fallbacks to AsyncLocalStorage to access request data
   */
  const clerkClientStore = clerkClientStorage.getStore();
  if (clerkClientStore) {
    requestData = clerkClientStore;
  } else {
    /**
     * For BAPI usage from application server, fallbacks to access request data via `NextRequest`
     */
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

const clerkClient: ClerkClient & typeof clerkClientForRequest = Object.assign(
  clerkClientForRequest,
  // TODO SDK-1839 - Remove `clerkClient` singleton in the next major version of `@clerk/nextjs`
  clerkClientSingletonProxy,
);

export { clerkClient };
