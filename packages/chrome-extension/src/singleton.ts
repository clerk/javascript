import { Clerk } from '@clerk/clerk-js';
import type { ClerkProp } from '@clerk/clerk-react';
import { parsePublishableKey } from '@clerk/shared';

import { STORAGE_KEY_CLIENT_JWT } from './constants';
import { logErrorHandler } from './errors';
import { getClientCookie } from './utils/cookies';
import { ChromeStorageCache } from './utils/storage';

export let clerk: ClerkProp;

type BuildClerkOptions = {
  publishableKey: string;
};

export async function buildClerk({ publishableKey }: BuildClerkOptions): Promise<ClerkProp> {
  if (clerk) {
    return clerk;
  }

  const { frontendApi, instanceType } = parsePublishableKey(publishableKey) || {};

  if (!frontendApi || !instanceType) {
    throw new Error('Invalid publishable key.');
  }

  const clientCookie = await getClientCookie(frontendApi).catch(logErrorHandler);

  // TODO: Listen to client cookie changes and sync updates
  // https://developer.chrome.com/docs/extensions/reference/cookies/#event-onChanged

  const KEY = ChromeStorageCache.createKey(frontendApi, STORAGE_KEY_CLIENT_JWT);

  if (clientCookie) {
    await ChromeStorageCache.set(KEY, clientCookie.value).catch(logErrorHandler);
  }

  clerk = new Clerk(publishableKey);

  // @ts-expect-error - Clerk doesn't expose this unstable method
  clerk.__unstable__onBeforeRequest(async requestInit => {
    requestInit.credentials = 'omit';
    requestInit.url?.searchParams.append('_is_native', '1');

    const jwt = await ChromeStorageCache.get(KEY);
    (requestInit.headers as Headers).set('authorization', jwt || '');
  });

  // @ts-expect-error - Clerk doesn't expose this unstable method
  clerk.__unstable__onAfterResponse(async (_, response) => {
    const authHeader = response.headers.get('authorization');
    if (authHeader) {
      await ChromeStorageCache.set(KEY, authHeader);
    }
  });

  return clerk;
}
