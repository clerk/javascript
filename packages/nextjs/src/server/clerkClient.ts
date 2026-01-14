import { constants } from '@clerk/backend/internal';

import { buildRequestLike, isNextjsUseCacheError, isPrerenderingBailout } from '../app-router/server/utils';
import { createClerkClientWithOptions } from './createClerkClient';
import { getHeader } from './headers-utils';
import { clerkMiddlewareRequestDataStorage } from './middleware-storage';
import { decryptClerkRequestData } from './utils';

/**
 * Constructs a BAPI client that accesses request data within the runtime.
 * Necessary if middleware dynamic keys are used.
 */
const clerkClient = async () => {
  let requestData;

  try {
    const request = await buildRequestLike();
    const encryptedRequestData = getHeader(request, constants.Headers.ClerkRequestData);
    requestData = decryptClerkRequestData(encryptedRequestData);
  } catch (err) {
    if (err && isPrerenderingBailout(err)) {
      throw err;
    }
    // Re-throw "use cache" errors with the helpful message from buildRequestLike
    if (err && isNextjsUseCacheError(err)) {
      throw err;
    }
  }

  // Fallbacks between options from middleware runtime and `NextRequest` from application server
  const options = clerkMiddlewareRequestDataStorage.getStore()?.get('requestData') ?? requestData;
  if (options?.secretKey || options?.publishableKey) {
    return createClerkClientWithOptions(options);
  }

  return createClerkClientWithOptions({});
};

export { clerkClient };
