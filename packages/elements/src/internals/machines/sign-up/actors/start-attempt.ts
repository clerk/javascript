import type { LoadedClerk, SignUpResource } from '@clerk/types';
import { fromPromise } from 'xstate';

import { fieldsToSignUpParams } from '~/internals/machines/sign-up/utils/fields-to-params';

import type { FormFields } from '../../form';

export type StartAttemptParams = { strategy: 'ticket'; ticket: string } | { strategy?: never; ticket?: never };
export type StartAttemptInput = { clerk: LoadedClerk; fields: FormFields; params?: StartAttemptParams };
export type StartAttemptOutput = SignUpResource;

// TODO: Also used for continueAttempt
export const startAttempt = fromPromise<StartAttemptOutput, StartAttemptInput>(({ input }) => {
  const { clerk, fields, params } = input;
  return clerk.client.signUp.create({ ...fieldsToSignUpParams(fields), ...params });
});
