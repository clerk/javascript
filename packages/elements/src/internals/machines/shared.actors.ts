import type { Clerk, LoadedClerk } from '@clerk/types';
import { fromPromise } from 'xstate';

export const waitForClerk = fromPromise<LoadedClerk, Clerk | LoadedClerk>(({ input: clerk }) => {
  return new Promise(resolve => {
    if (clerk.loaded) {
      resolve(clerk as LoadedClerk);
    } else {
      clerk.addOnLoaded(() => resolve(clerk as LoadedClerk));
    }
  });
});
