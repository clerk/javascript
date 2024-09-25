import type { LoadedClerk, PrepareVerificationParams, SignUpResource } from '@clerk/types';
import { fromPromise } from 'xstate';

export type VerificationPrepareInput = { clerk: LoadedClerk; params: PrepareVerificationParams };
export type VerificationPrepareOutput = SignUpResource;

export const verificationPrepare = fromPromise<VerificationPrepareOutput, VerificationPrepareInput>(({ input }) => {
  const { clerk, params } = input;

  if (params.strategy === 'email_link' && params.redirectUrl) {
    params.redirectUrl = clerk.buildUrlWithAuth(params.redirectUrl);
  }

  return clerk.client.signUp.prepareVerification(params);
});
