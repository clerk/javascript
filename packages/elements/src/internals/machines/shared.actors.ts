import type { Clerk } from '@clerk/types';
import { fromPromise } from 'xstate';

export const waitForClerk = fromPromise(
  // @ts-expect-error -- not specified on the type
  ({ input: clerk }: { input: Clerk }) => new Promise(resolve => clerk.addOnLoaded(resolve)),
);
