import type { FapiRequestInit, FapiResponse } from '@clerk/clerk-js/dist/types/core/fapiClient';
import { Clerk } from '@clerk/clerk-js/headless';
import type { HeadlessBrowserClerk } from '@clerk/clerk-react';

import type { TokenCache } from '../caches/MemoryTokenCache';
import { MemoryTokenCache } from './cache/MemoryTokenCache';
import { errorThrower } from './errorThrower';

Clerk.sdkMetadata = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
};

const KEY = '__clerk_client_jwt';

/**
 * @deprecated Use `getClerkInstance` instead. `Clerk` will be removed in the next major version.
 */
export let clerk: HeadlessBrowserClerk;
let __internal_clerk: HeadlessBrowserClerk | undefined;

type BuildClerkOptions = {
  publishableKey?: string;
  tokenCache?: TokenCache;
};

/**
 * Access or create a Clerk instance outside of React.
 * @example
 * import { ClerkProvider, getClerkInstance } from "@clerk/expo"
 *
 * const clerkInstance = getClerkInstance({ publishableKey: 'xxxx' })
 *
 * // Always pass the `publishableKey` to `ClerkProvider`
 * <ClerkProvider publishableKey={'xxxx'}>
 *     ...
 * </ClerkProvider>
 *
 * // Somewhere in your code, outside of React you can do
 * const token = await clerkInstance.session?.getToken();
 * fetch('http://example.com/', {headers: {Authorization: token })
 * @throws MissingPublishableKeyError publishableKey is missing and Clerk has not been initialized yet
 * @returns HeadlessBrowserClerk
 */
export function getClerkInstance(options?: BuildClerkOptions): HeadlessBrowserClerk {
  const { publishableKey = process.env.CLERK_PUBLISHABLE_KEY || '', tokenCache = MemoryTokenCache } = options || {};

  if (!__internal_clerk && !publishableKey) {
    errorThrower.throwMissingPublishableKeyError();
  }

  // Support "hot-swapping" the Clerk instance at runtime. See JS-598 for additional details.
  const hasKeyChanged = __internal_clerk && !!publishableKey && publishableKey !== __internal_clerk.publishableKey;

  if (!__internal_clerk || hasKeyChanged) {
    if (hasKeyChanged) {
      tokenCache.clearToken?.(KEY);
    }

    const getToken = tokenCache.getToken;
    const saveToken = tokenCache.saveToken;
    __internal_clerk = clerk = new Clerk(publishableKey);

    // @ts-expect-error
    __internal_clerk.__unstable__onBeforeRequest(async (requestInit: FapiRequestInit) => {
      // https://reactnative.dev/docs/0.61/network#known-issues-with-fetch-and-cookie-based-authentication
      requestInit.credentials = 'omit';

      requestInit.url?.searchParams.append('_is_native', '1');

      const jwt = await getToken(KEY);
      (requestInit.headers as Headers).set('authorization', jwt || '');
    });

    // @ts-expect-error
    __internal_clerk.__unstable__onAfterResponse(async (_: FapiRequestInit, response: FapiResponse<unknown>) => {
      const authHeader = response.headers.get('authorization');
      if (authHeader) {
        await saveToken(KEY, authHeader);
      }
    });
  }
  return __internal_clerk;
}
