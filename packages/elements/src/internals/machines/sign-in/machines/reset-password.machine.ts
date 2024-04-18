import type { SignInResource } from '@clerk/types';
import type { ActorRefFrom, DoneActorEvent } from 'xstate';
import { fromPromise, sendTo, setup } from 'xstate';

import type { FormFields } from '~/internals/machines/form/form.types';
import { sendToLoading } from '~/internals/machines/shared.actions';
import { type TSignInRouterMachine } from '~/internals/machines/sign-in/machines/router.machine';
import type { SignInResetPasswordSchema } from '~/internals/machines/sign-in/types';
import { assertActorEventError } from '~/internals/machines/utils/assert';

export type TSignInResetPasswordMachine = typeof SignInResetPasswordMachine;

export const SignInResetPasswordMachineId = 'SignInResetPasswordMachine';

export const SignInResetPasswordMachine = setup({
  actors: {
    attempt: fromPromise<SignInResource, { parent: ActorRefFrom<TSignInRouterMachine>; fields: FormFields }>(
      ({ input: { fields, parent } }) => {
        const password = (fields.get('password')?.value as string) || '';
        return parent.getSnapshot().context.clerk.client.signIn.resetPassword({ password });
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
    sendToLoading,
    sendToNext: ({ context, event }) =>
      context.parent.send({ type: 'NEXT', resource: (event as unknown as DoneActorEvent<SignInResource>).output }),
  },
  types: {} as SignInResetPasswordSchema,
}).createMachine({
  id: SignInResetPasswordMachineId,
  context: ({ input }) => ({
    loadingStep: 'reset-password',
    parent: input.parent,
    formRef: input.form,
  }),
  initial: 'Pending',
  states: {
    Pending: {
      tags: ['state:pending'],
      description: 'Waiting for user input',
      on: {
        SUBMIT: {
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
