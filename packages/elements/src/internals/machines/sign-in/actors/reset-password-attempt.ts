import type { LoadedClerk, SignInResource } from '@clerk/types';
import { fromPromise } from 'xstate';

import type { FormFields } from '../../form';

export type ResetPasswordAttemptInput = { clerk: LoadedClerk; fields: FormFields };
export type ResetPasswordAttemptOutput = SignInResource;

export const resetPasswordAttempt = fromPromise<ResetPasswordAttemptOutput, ResetPasswordAttemptInput>(({ input }) => {
  const { clerk, fields } = input;

  const password = (fields.get('password')?.value as string) || '';
  const signOutOfOtherSessions = fields.get('signOutOfOtherSessions')?.checked || false;

  return clerk.client.signIn.resetPassword({ password, signOutOfOtherSessions });
});
