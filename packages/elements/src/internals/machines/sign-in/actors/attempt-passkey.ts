import type { LoadedClerk, SignInResource } from '@clerk/types';
import { fromPromise } from 'xstate';

export type AttemptPasskeyInput = { clerk: LoadedClerk; flow: 'autofill' | 'discoverable' | undefined };
export type AttemptPasskeyOutput = SignInResource;

export const attemptPasskey = fromPromise<AttemptPasskeyOutput, AttemptPasskeyInput>(({ input }) => {
  const { clerk, flow } = input;

  return clerk.client.signIn.authenticateWithPasskey({
    flow,
  });
});
