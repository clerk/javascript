import type { SignInResource } from '@clerk/types';
import type { ActorRefFrom } from 'xstate';
import { fromPromise, sendParent, sendTo, setup } from 'xstate';

import { SIGN_IN_DEFAULT_BASE_PATH } from '~/internals/constants';
import type { FormFields } from '~/internals/machines/form/form.types';
import { type TSignInRouterMachine } from '~/internals/machines/sign-in/machines/router.machine';
import type { SignInStartSchema } from '~/internals/machines/sign-in/types';
import { assertActorEventError } from '~/internals/machines/utils/assert';

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
  types: {} as SignInStartSchema,
}).createMachine({
  id: SignInStartMachineId,
  context: ({ input }) => ({
    basePath: input.basePath || SIGN_IN_DEFAULT_BASE_PATH,
    parent: input.parent,
    formRef: input.form,
  }),
  initial: 'Pending',
  states: {
    Pending: {
      tags: ['state:pending'],
      description: 'Waiting for user input',
      on: {
        SUBMIT: 'Attempting',
      },
    },
    Attempting: {
      tags: ['state:attempting', 'state:loading'],
      invoke: {
        id: 'attempt',
        src: 'attempt',
        input: ({ context }) => ({
          parent: context.parent,
          fields: context.formRef.getSnapshot().context.fields,
        }),
        onDone: {
          actions: [
            sendParent({ type: 'NEXT' }),
            sendParent(({ event }) => {
              const signInResource = event.output;
              const firstFactorStrategy = signInResource.firstFactorVerification.strategy;

              return {
                type: 'LOADING',
                step: 'start',
                strategy: firstFactorStrategy ? firstFactorStrategy : 'identifier',
              };
            }),
          ],
        },
        onError: {
          actions: 'setFormErrors',
          target: 'Pending',
        },
      },
    },
  },
});
