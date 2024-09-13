import type { IsomorphicClerk } from '../isomorphicClerk';

/**
 * @internal
 */
const clerkLoaded = (isomorphicClerk: IsomorphicClerk) => {
  // Throwing an error makes Next.js to proceed with the client hydration
  // if (typeof window === 'undefined') {
  //   return Promise.reject();
  // }

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
export const createGetToken = (isomorphicClerk: IsomorphicClerk) => {
  console.log('`createGetToken` executed 📚📚📚');

  return async (options: any) => {
    console.log('starting to load 🏃‍♂️');
    await clerkLoaded(isomorphicClerk);
    if (!isomorphicClerk.session) {
      console.log('`isomorphicClerk.session` is null ❌');
      return null;
    }
    console.log('loaded ✅');
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
