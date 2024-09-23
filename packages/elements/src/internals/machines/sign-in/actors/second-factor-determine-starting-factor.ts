import type { LoadedClerk, SignInSecondFactor } from '@clerk/types';
import { fromPromise } from 'xstate';

import { determineStartingSignInSecondFactor } from '../utils';

export type SecondFactorDetermineStartingFactorInput = { clerk: LoadedClerk };
export type SecondFactorDetermineStartingFactorOutput = SignInSecondFactor | null;

export const secondFactorDetermineStartingFactor = fromPromise<
  SecondFactorDetermineStartingFactorOutput,
  SecondFactorDetermineStartingFactorInput
>(async ({ input }) => {
  return Promise.resolve(determineStartingSignInSecondFactor(input.clerk.client.signIn.supportedSecondFactors));
});
