import type { FapiRequestInit, FapiResponse } from '@clerk/clerk-js/dist/types/core/fapiClient';
import { Clerk } from '@clerk/clerk-js/headless';
import type { HeadlessBrowserClerk } from '@clerk/clerk-react';

import type { TokenCache } from './cache';
import { MemoryTokenCache } from './cache';

Clerk.sdkMetadata = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

const KEY = '__clerk_client_jwt';

/**
 * @deprecated This export will be dropped
 */
export let clerk: HeadlessBrowserClerk;

type BuildClerkOptions = {
  publishableKey?: string;
  tokenCache?: TokenCache;
};

export function createClerkClient({
  publishableKey = process.env.CLERK_PUBLISHABLE_KEY || '',
  tokenCache = MemoryTokenCache,
}: BuildClerkOptions): HeadlessBrowserClerk {
  const clerk = new Clerk(publishableKey);

  tokenCache.clearToken?.(KEY);

  const getToken = tokenCache.getToken;
  const saveToken = tokenCache.saveToken;

  clerk.__unstable__onBeforeRequest(async (requestInit: FapiRequestInit) => {
    // https://reactnative.dev/docs/0.61/network#known-issues-with-fetch-and-cookie-based-authentication
    requestInit.credentials = 'omit';

    requestInit.url?.searchParams.append('_is_native', '1');

    const jwt = await getToken(KEY);
    (requestInit.headers as Headers).set('authorization', jwt || '');
  });

  // @ts-expect-error
  clerk.__unstable__onAfterResponse(async (_: FapiRequestInit, response: FapiResponse<unknown>) => {
    const authHeader = response.headers.get('authorization');
    if (authHeader) {
      await saveToken(KEY, authHeader);
    }
  });

  return clerk;
}

export function buildClerk({ publishableKey, tokenCache }: Required<BuildClerkOptions>): HeadlessBrowserClerk {
  // Support "hot-swapping" the Clerk instance at runtime. See JS-598 for additional details.
  const hasKeyChanged = clerk && publishableKey !== clerk.publishableKey;

  if (hasKeyChanged) {
    tokenCache.clearToken?.(KEY);
  }

  if (!clerk || hasKeyChanged) {
    clerk = createClerkClient({ publishableKey, tokenCache });
  }

  return clerk;
}
