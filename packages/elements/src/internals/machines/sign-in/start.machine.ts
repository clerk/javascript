import type { SignInResource } from '@clerk/types';
import type { ActorRefFrom } from 'xstate';
import { fromPromise, not, sendTo, setup } from 'xstate';

import { SIGN_IN_DEFAULT_BASE_PATH } from '~/internals/constants';
import type { FormFields } from '~/internals/machines/form';
import { sendToLoading } from '~/internals/machines/shared';
import { assertActorEventError } from '~/internals/machines/utils/assert';

import type { TSignInRouterMachine } from './router.machine';
import type { SignInStartSchema } from './start.types';

export type TSignInStartMachine = typeof SignInStartMachine;

export const SignInStartMachineId = 'SignInStart';

export const SignInStartMachine = setup({
  actors: {
    attempt: fromPromise<SignInResource, { parent: ActorRefFrom<TSignInRouterMachine>; fields: FormFields }>(
      ({ input: { fields, parent } }) => {
        const clerk = parent.getSnapshot().context.clerk;

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
      },
    ),
  },
  actions: {
    sendToNext: ({ context }) => context.parent.send({ type: 'NEXT' }),
    sendToLoading,
    setFormErrors: sendTo(
      ({ context }) => context.formRef,
      ({ event }) => {
        assertActorEventError(event);
        return {
          type: 'ERRORS.SET',
          error: event.error,
        };
      },
    ),
  },
  guards: {
    isExampleMode: ({ context }) => Boolean(context.parent.getSnapshot().context.exampleMode),
  },
  types: {} as SignInStartSchema,
}).createMachine({
  id: SignInStartMachineId,
  context: ({ input }) => ({
    basePath: input.basePath || SIGN_IN_DEFAULT_BASE_PATH,
    parent: input.parent,
    formRef: input.formRef,
    loadingStep: 'start',
  }),
  initial: 'Pending',
  states: {
    Pending: {
      tags: ['state:pending'],
      description: 'Waiting for user input',
      on: {
        SUBMIT: {
          guard: not('isExampleMode'),
          target: 'Attempting',
          reenter: true,
        },
      },
    },
    Attempting: {
      tags: ['state:attempting', 'state:loading'],
      entry: 'sendToLoading',
      invoke: {
        id: 'attempt',
        src: 'attempt',
        input: ({ context }) => ({
          parent: context.parent,
          fields: context.formRef.getSnapshot().context.fields,
        }),
        onDone: {
          actions: ['sendToNext', 'sendToLoading'],
        },
        onError: {
          actions: ['setFormErrors', 'sendToLoading'],
          target: 'Pending',
        },
      },
    },
  },
});
