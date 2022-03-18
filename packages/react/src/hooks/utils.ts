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
export const createGetToken = (isomorphicClerk: IsomorphicClerk) => async (options: any) => {
  await clerkLoaded(isomorphicClerk);
  if (isomorphicClerk.session) {
    return isomorphicClerk.session.getToken(options);
  }
  return null;
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
