import type { IsomorphicClerk } from '../isomorphicClerk';

/**
 * @internal
 */
const clerkLoaded = (isomorphicClerk: IsomorphicClerk) => {
  return new Promise<void>(resolve => {
    isomorphicClerk.onLifecycle(status => {
      if (status === 'ready') {
        resolve();
      }
    });
  });
};

/**
 * @internal
 */
export const createGetToken = (isomorphicClerk: IsomorphicClerk) => {
  return async (options: any) => {
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
