import type { AttemptVerificationParams, LoadedClerk, SignUpResource } from '@clerk/types';
import { fromPromise } from 'xstate';

export type VerificationAttemptInput = { clerk: LoadedClerk; params: AttemptVerificationParams };
export type VerificationAttemptOutput = SignUpResource;

export const verificationAttempt = fromPromise<VerificationAttemptOutput, VerificationAttemptInput>(({ input }) => {
  const { clerk, params } = input;
  return clerk.client.signUp.attemptVerification(params);
});
