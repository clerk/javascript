import type { LoadedClerk, SignInFirstFactor } from '@clerk/types';
import { fromPromise } from 'xstate';

import { determineStartingSignInFactor } from '../utils';

export type FirstFactorDetermineStartingFactorInput = { clerk: LoadedClerk };
export type FirstFactorDetermineStartingFactorOutput = SignInFirstFactor | null;

export const firstFactorDetermineStartingFactor = fromPromise<
  FirstFactorDetermineStartingFactorOutput,
  FirstFactorDetermineStartingFactorInput
>(async ({ input }) => {
  return Promise.resolve(
    determineStartingSignInFactor(
      input.clerk.client.signIn.supportedFirstFactors,
      input.clerk.client.signIn.identifier,
      input.clerk.__unstable__environment?.displayConfig.preferredSignInStrategy,
    ),
  );
});
