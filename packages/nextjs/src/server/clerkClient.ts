import { constants } from '@clerk/backend/internal';
import { parsePublishableKey } from '@clerk/shared/keys';
import { addClerkPrefix, stripScheme } from '@clerk/shared/url';

import { buildRequestLike, isClerkUseCacheError, isPrerenderingBailout } from '../app-router/server/utils';
import { DOMAIN, PROXY_URL, PUBLISHABLE_KEY } from './constants';
import { createClerkClientWithOptions } from './createClerkClient';
import { getHeader } from './headers-utils';
import { clerkMiddlewareRequestDataStorage } from './middleware-storage';
import { decryptClerkRequestData } from './utils';

/**
 * Constructs a BAPI client that accesses request data within the runtime.
 * Necessary if middleware dynamic keys are used.
 */
const requestOptions = async () => {
  let requestData;

  try {
    const request = await buildRequestLike();
    const encryptedRequestData = getHeader(request, constants.Headers.ClerkRequestData);
    requestData = decryptClerkRequestData(encryptedRequestData);
  } catch (err) {
    if (err && isPrerenderingBailout(err)) {
      throw err;
    }
    if (err && isClerkUseCacheError(err)) {
      throw err;
    }
  }

  // Fallbacks between options from middleware runtime and `NextRequest` from application server
  return clerkMiddlewareRequestDataStorage.getStore()?.get('requestData') ?? requestData;
};

const createRequestClient = (options: Awaited<ReturnType<typeof requestOptions>>) => {
  if (options?.secretKey || options?.publishableKey) {
    return createClerkClientWithOptions(options);
  }

  return createClerkClientWithOptions({});
};

const clerkClient = async () => createRequestClient(await requestOptions());

export async function getClerkClientAndRouting() {
  const options = await requestOptions();
  const publishableKey = options?.publishableKey || PUBLISHABLE_KEY;
  const parsedKey = parsePublishableKey(publishableKey);
  const proxyUrl = options?.proxyUrl ?? PROXY_URL;
  const domain = options?.domain ?? DOMAIN;
  if (!publishableKey || !parsedKey || typeof proxyUrl === 'function' || typeof domain === 'function') {
    throw new Error('Clerk request routing is unavailable.');
  }
  return {
    client: createRequestClient(options),
    routing: {
      publishableKey,
      frontendApi: parsedKey.frontendApi,
      proxyUrl,
      domain:
        parsedKey.instanceType === 'production' ? addClerkPrefix(stripScheme(domain ?? '')) : stripScheme(domain ?? ''),
    },
  };
}

export { clerkClient };
