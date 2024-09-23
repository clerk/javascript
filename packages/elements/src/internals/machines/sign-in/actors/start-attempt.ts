import type { LoadedClerk, SignInResource } from '@clerk/types';
import { fromPromise } from 'xstate';

import type { FormFields } from '../../form';

export type StartAttemptInput = { clerk: LoadedClerk; fields: FormFields };
export type StartAttemptOutput = SignInResource;

export const startAttempt = fromPromise<SignInResource, StartAttemptInput>(({ input }) => {
  const { clerk, fields } = input;

  const password = fields.get('password');
  const identifier = fields.get('identifier');

  const passwordParams = password?.value
    ? {
        password: password.value,
        strategy: 'password',
      }
    : {};

  return clerk.client.signIn.create({
    identifier: (identifier?.value as string) || '',
    ...passwordParams,
  });
});
