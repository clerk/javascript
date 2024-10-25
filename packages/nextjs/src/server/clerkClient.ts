import { ClerkClient, createClerkClient } from '@clerk/backend';
import { constants } from '@clerk/backend/internal';
import { DeepProxy } from 'proxy-deep';

import { buildRequestLike, isPrerenderingBailout } from '../app-router/server/utils';
import { clerkMiddlewareRequestDataStorage } from './clerkMiddleware';
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
 * Constructs a BAPI client that accesses request data within the runtime.
 * Necessary if middleware dynamic keys are used.
 */
const clerkClient = () => {
  const promise = new Promise<ReturnType<typeof createClerkClient>>(async (resolve, reject) => {
    let requestData;

    try {
      const request = await buildRequestLike();
      const encryptedRequestData = getHeader(request, constants.Headers.ClerkRequestData);
      requestData = decryptClerkRequestData(encryptedRequestData);
    } catch (err) {
      if (err && isPrerenderingBailout(err)) {
        reject(err);
      }
    }

    // Fallbacks between options from middleware runtime and `NextRequest` from application server
    const options = clerkMiddlewareRequestDataStorage.getStore()?.get('requestData') ?? requestData;
    if (options?.secretKey || options?.publishableKey) {
      resolve(createClerkClientWithOptions(options));
      return;
    }

    resolve(createClerkClientWithOptions({}));
  });

  return new DeepProxy(promise, {
    apply(_, __, argumentsList) {
      return promise.then(client => {
        const fn = this.path.reduce((result, key) => {
          // @ts-expect-error -- because the public type is of ClerkClient, we should be able to assume that property access is accurate here.
          return result[key];
        }, client) as unknown as (...args: any) => any;

        fn?.(...argumentsList);
      });
    },
  }) as ThenableClerkClient;
};

type ThenableClerkClient = Promise<ClerkClient> & ClerkClient;

export { clerkClient };
