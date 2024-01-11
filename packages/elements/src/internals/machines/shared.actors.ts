import type { Clerk, LoadedClerk } from '@clerk/types';
import { fromPromise } from 'xstate';

import { ClerkElementsRuntimeError } from '~/internals/errors/error';

export const waitForClerk = fromPromise<LoadedClerk, Clerk | LoadedClerk>(({ input: clerk }) => {
  return new Promise((resolve, reject) => {
    if (clerk.loaded) {
      resolve(clerk as LoadedClerk);
    } else if ('addOnLoaded' in clerk) {
      // @ts-expect-error - Expects addOnLoaded from IsomorphicClerk.
      // We don't want internals to rely on the @clerk/clerk-react package
      clerk.addOnLoaded(() => resolve(clerk as LoadedClerk));
    } else {
      reject(new ClerkElementsRuntimeError('Clerk client could not be loaded'));
    }
  });
});
