// @ts-ignore
import Clerk from '@clerk/clerk-js/dist/clerk.headless';
import type { FapiRequestInit, FapiResponse } from '@clerk/clerk-js/dist/types/src/core/fapiClient';
import type { ClerkProp } from '@clerk/clerk-react';

import { getToken as getTokenFromMemory, saveToken as saveTokenInMemory, TokenCache } from './cache';

const KEY = '__clerk_client_jwt';

export let clerk: ClerkProp;

type BuildClerkOptions = {
  frontendApi: string;
  tokenCache?: TokenCache;
};

export function buildClerk({ frontendApi, tokenCache }: BuildClerkOptions): ClerkProp {
  const getToken = (tokenCache && tokenCache.getToken) ?? getTokenFromMemory;
  const saveToken = (tokenCache && tokenCache.saveToken) ?? saveTokenInMemory;

  if (!clerk) {
    clerk = new Clerk(frontendApi);

    if (!tokenCache) {
      return clerk;
    }

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
