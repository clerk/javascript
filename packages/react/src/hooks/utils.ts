import { inBrowser } from '@clerk/shared/browser';
import { ClerkRuntimeError } from '@clerk/shared/error';

import type { IsomorphicClerk } from '../isomorphicClerk';

/**
 * @internal
 */
const clerkLoaded = (isomorphicClerk: IsomorphicClerk) => {
  return new Promise<void>(resolve => {
    const handler = (status: string) => {
      if (['ready', 'degraded'].includes(status)) {
        resolve();
        isomorphicClerk.off('status', handler);
      }
    };

    // Register the event listener
    isomorphicClerk.on('status', handler, { notify: true });
  });
};

/**
 * @internal
 */
export const createGetToken = (isomorphicClerk: IsomorphicClerk) => {
  return async (options: any) => {
    if (!inBrowser()) {
      throw new ClerkRuntimeError(
        'useAuth().getToken() can only be used in browser environments. To access auth data server-side, see the Auth object reference doc: https://clerk.com/docs/reference/backend/types/auth-object',
        {
          code: 'clerk_runtime_not_browser',
        },
      );
    }

    await clerkLoaded(isomorphicClerk);
    if (!isomorphicClerk.session) {
      return null;
    }
    return isomorphicClerk.session.getToken(options);
  };
};

/**
 * @internal
 */
export const createSignOut = (isomorphicClerk: IsomorphicClerk) => {
  return async (...args: any) => {
    await clerkLoaded(isomorphicClerk);
    return isomorphicClerk.signOut(...args);
  };
};
