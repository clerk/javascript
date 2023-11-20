import type { FapiRequestInit, FapiResponse } from '@clerk/clerk-js/dist/types/core/fapiClient';
import { Clerk } from '@clerk/clerk-js/headless';
import type { HeadlessBrowserClerk } from '@clerk/clerk-react';

import type { TokenCache } from './cache';

Clerk.sdkMetadata = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

const KEY = '__clerk_client_jwt';

export let clerk: HeadlessBrowserClerk;

type BuildClerkOptions = {
  key: string;
  tokenCache: TokenCache;
};

export function buildClerk({ key, tokenCache }: BuildClerkOptions): HeadlessBrowserClerk {
  // Support "hot-swapping" the Clerk instance at runtime. See JS-598 for additional details.
  const hasKeyChanged = clerk && key !== clerk.publishableKey;

  if (!clerk || hasKeyChanged) {
    if (hasKeyChanged) {
      tokenCache.clearToken?.(KEY);
    }

    const getToken = tokenCache.getToken;
    const saveToken = tokenCache.saveToken;
    // TODO: DO NOT ACCEPT THIS
    clerk = new Clerk(key);

    // @ts-expect-error
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
  }

  return clerk;
}
