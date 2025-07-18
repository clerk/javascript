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
