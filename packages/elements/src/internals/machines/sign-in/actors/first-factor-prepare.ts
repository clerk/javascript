import type { LoadedClerk, PrepareFirstFactorParams, SignInFirstFactor, SignInResource } from '@clerk/types';
import { fromPromise } from 'xstate';

import { assertIsDefined } from '../../utils/assert';

export type FirstFactorPrepareInput = {
  clerk: LoadedClerk;
  params: PrepareFirstFactorParams;
  resendable: boolean;
};
export type FirstFactorPrepareOutput = SignInResource;

const isNonPreparableStrategy = (strategy?: SignInFirstFactor['strategy']) => {
  if (!strategy) {
    return false;
  }

  return ['passkey', 'password'].includes(strategy);
};

export const firstFactorPrepare = fromPromise<FirstFactorPrepareOutput, FirstFactorPrepareInput>(async ({ input }) => {
  const { clerk, params, resendable } = input;

  // If a prepare call has already been fired recently, don't re-send
  const currentVerificationExpiration = clerk.client.signIn.firstFactorVerification.expireAt;
  const needsPrepare = resendable || !currentVerificationExpiration || currentVerificationExpiration < new Date();

  if (isNonPreparableStrategy(params?.strategy) || !needsPrepare) {
    return Promise.resolve(clerk.client.signIn);
  }

  assertIsDefined(params, 'First factor params');
  return await clerk.client.signIn.prepareFirstFactor(params);
});
