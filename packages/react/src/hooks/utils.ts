import IsomorphicClerk from '../isomorphicClerk';

/**
 * @internal
 */
const clerkLoaded = (isomorphicClerk: IsomorphicClerk) => {
  return new Promise<void>(resolve => {
    if (isomorphicClerk.loaded) {
      resolve();
    }
    isomorphicClerk.addOnLoaded(resolve);
  });
};

/**
 * @internal
 */
export const createGetToken =
  (isomorphicClerk: IsomorphicClerk) => async (options: any) => {
    await clerkLoaded(isomorphicClerk);
    if (!isomorphicClerk.session) {
      throw new Error(
        'getToken cannot be called without a session. Check if sessionId has a value before calling getToken',
      );
    }
    return isomorphicClerk.session.getToken(options);
  };

/**
 * @internal
 */
export const createSignOut =
  (isomorphicClerk: IsomorphicClerk) =>
  async (...args: any) => {
    await clerkLoaded(isomorphicClerk);
    return isomorphicClerk.signOut(...args);
  };
