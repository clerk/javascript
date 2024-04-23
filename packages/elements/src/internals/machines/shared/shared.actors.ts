import type { Clerk, LoadedClerk } from '@clerk/types';
import type { EventObject } from 'xstate';
import { fromCallback, fromPromise } from 'xstate';

import { ClerkElementsRuntimeError } from '~/internals/errors';

// TODO: Remove
/** @deprecated Use clerkLoader instead */
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

export type ClerkLoaderEvents = { type: 'CLERK.READY' } | { type: 'CLERK.ERROR'; message: string };

export const clerkLoader = fromCallback<EventObject, Clerk | LoadedClerk>(({ sendBack, input: clerk }) => {
  const reportLoaded = () => sendBack({ type: 'CLERK.READY' });

  if (clerk.loaded) {
    reportLoaded();
  } else if ('addOnLoaded' in clerk) {
    // @ts-expect-error - Expects `addOnLoaded` from @clerk/clerk-react's IsomorphicClerk.
    clerk.addOnLoaded(reportLoaded);
  } else {
    sendBack({ type: 'ERROR', message: 'Clerk client could not be loaded' });
  }

  return () => {};
});
