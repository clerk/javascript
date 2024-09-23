import type { LoadedClerk, PrepareSecondFactorParams, SignInResource } from '@clerk/types';
import { fromPromise } from 'xstate';

import { assertIsDefined } from '../../utils/assert';

export type SecondFactorPrepareInput = {
  clerk: LoadedClerk;
  params: PrepareSecondFactorParams;
  resendable: boolean;
};
export type SecondFactorPrepareOutput = SignInResource;

export const secondFactorPrepare = fromPromise<SecondFactorPrepareOutput, SecondFactorPrepareInput>(
  async ({ input }) => {
    const { clerk, params, resendable } = input;

    // If a prepare call has already been fired recently, don't re-send
    const currentVerificationExpiration = clerk.client.signIn.secondFactorVerification.expireAt;
    const needsPrepare = resendable || !currentVerificationExpiration || currentVerificationExpiration < new Date();

    assertIsDefined(params, 'Second factor params');

    if (params.strategy !== 'phone_code' || !needsPrepare) {
      return Promise.resolve(clerk.client.signIn);
    }

    return await clerk.client.signIn.prepareSecondFactor({
      strategy: params.strategy,
      phoneNumberId: params.phoneNumberId,
    });
  },
);
