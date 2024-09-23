import type { LoadedClerk, SignInResource, SignInSecondFactor } from '@clerk/types';
import { fromPromise } from 'xstate';

import type { FormFields } from '../../form';
import { assertIsDefined } from '../../utils/assert';

export type SecondFactorAttemptInput = {
  clerk: LoadedClerk;
  currentFactor: SignInSecondFactor | null;
  fields: FormFields;
};
export type SecondFactorAttemptOutput = SignInResource;

export const secondFactorAttempt = fromPromise<SecondFactorAttemptOutput, SecondFactorAttemptInput>(
  async ({ input }) => {
    const { clerk, fields, currentFactor } = input;

    const code = fields.get('code')?.value as string;

    assertIsDefined(currentFactor, 'Current factor');
    assertIsDefined(code, 'Code');

    return await clerk.client.signIn.attemptSecondFactor({
      strategy: currentFactor.strategy,
      code,
    });
  },
);
