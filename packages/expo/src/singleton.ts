import type { FapiRequestInit, FapiResponse } from '@clerk/clerk-js/dist/types/core/fapiClient';
import Clerk from '@clerk/clerk-js/headless';
import type { HeadlessBrowserClerk } from '@clerk/clerk-react';

import type { TokenCache } from './cache';

const KEY = '__clerk_client_jwt';

const getCacheKey = (publishableKey: string) => `${publishableKey}:${KEY}`;

export let clerk: HeadlessBrowserClerk;

type BuildClerkOptions = {
  key: string;
  tokenCache: TokenCache;
};

export function buildClerk({ key, tokenCache }: BuildClerkOptions): HeadlessBrowserClerk {
  if (!clerk) {
    const getToken = tokenCache.getToken;
    const saveToken = tokenCache.saveToken;
    // TODO: DO NOT ACCEPT THIS
    clerk = new Clerk(key);

    // @ts-expect-error
    clerk.__unstable__onBeforeRequest(async (requestInit: FapiRequestInit) => {
      // https://reactnative.dev/docs/0.61/network#known-issues-with-fetch-and-cookie-based-authentication
      requestInit.credentials = 'omit';

      requestInit.url?.searchParams.append('_is_native', '1');

      // To avoid logging everyone out we could use the old key as a fallback eg:
      const jwt = (await getToken(getCacheKey(key))) || (await getToken(KEY));
      (requestInit.headers as Headers).set('authorization', jwt || '');
    });

    // @ts-expect-error
    clerk.__unstable__onAfterResponse(async (_: FapiRequestInit, response: FapiResponse<unknown>) => {
      const authHeader = response.headers.get('authorization');
      if (authHeader) {
        await saveToken(getCacheKey(key), authHeader);
      }
    });
  }

  return clerk;
}
