import Clerk from '@clerk/clerk-js';
import type { ClerkProp } from '@clerk/clerk-react';

import type { TokenCache } from './cache';
import { convertPublishableKeyToFrontendAPIOrigin, getClientCookie } from './utils';

const KEY = '__clerk_client_jwt';

export let clerk: ClerkProp;

type BuildClerkOptions = {
  publishableKey: string;
  tokenCache: TokenCache;
};

export async function buildClerk({ publishableKey, tokenCache }: BuildClerkOptions): Promise<ClerkProp> {
  if (!clerk) {
    const clerkFrontendAPIOrigin = convertPublishableKeyToFrontendAPIOrigin(publishableKey);

    const clientCookie = await getClientCookie(clerkFrontendAPIOrigin);

    // TODO: Listen to client cookie changes and sync updates
    // https://developer.chrome.com/docs/extensions/reference/cookies/#event-onChanged

    if (clientCookie) {
      await tokenCache.saveToken(KEY, clientCookie.value);
    }

    clerk = new Clerk(publishableKey);

    // @ts-expect-error
    clerk.__unstable__onBeforeRequest(async requestInit => {
      requestInit.credentials = 'omit';
      requestInit.url?.searchParams.append('_is_native', '1');

      const jwt = await tokenCache.getToken(KEY);
      (requestInit.headers as Headers).set('authorization', jwt || '');
    });

    // @ts-expect-error
    clerk.__unstable__onAfterResponse(async (_, response) => {
      const authHeader = response.headers.get('authorization');
      if (authHeader) {
        await tokenCache.saveToken(KEY, authHeader);
      }
    });
  }

  return clerk;
}
