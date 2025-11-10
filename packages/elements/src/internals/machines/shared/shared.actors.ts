import type { Clerk, LoadedClerk } from '@clerk/shared/types';
import type { EventObject } from 'xstate';
import { fromCallback } from 'xstate';

export type ClerkLoaderEvents = { type: 'CLERK.READY' } | { type: 'CLERK.ERROR'; message: string };

export const clerkLoader = fromCallback<EventObject, Clerk | LoadedClerk>(({ sendBack, input: clerk }) => {
  const reportLoaded = () => sendBack({ type: 'CLERK.READY' });

  if (clerk.loaded) {
    reportLoaded();
  } else if ('addOnLoaded' in clerk) {
    // @ts-expect-error - Expects `addOnLoaded` from @clerk/shared/react's IsomorphicClerk.
    clerk.addOnLoaded(reportLoaded);
  } else {
    sendBack({ type: 'ERROR', message: 'Clerk client could not be loaded' });
  }

  return () => {};
});
