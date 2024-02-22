import type { SignUpResource } from '@clerk/types';
import type { ActorRefFrom } from 'xstate';
import { fromPromise, sendParent, sendTo, setup } from 'xstate';

import { SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import type { FormFields } from '~/internals/machines/form/form.types';
import type { TSignUpRouterMachine } from '~/internals/machines/sign-up/machines';
import type { SignUpContinueSchema } from '~/internals/machines/sign-up/types';
import { fieldsToSignUpParams } from '~/internals/machines/sign-up/utils';
import { assertActorEventError } from '~/internals/machines/utils/assert';

export type TSignUpContinueMachine = typeof SignUpContinueMachine;

export const SignUpContinueMachineId = 'SignUpContinue';

export const SignUpContinueMachine = setup({
  actors: {
    attempt: fromPromise<SignUpResource, { parent: ActorRefFrom<TSignUpRouterMachine>; fields: FormFields }>(
      ({ input: { fields, parent } }) => {
        const params = fieldsToSignUpParams(fields);
        return parent.getSnapshot().context.clerk.client.signUp.update(params);
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
  types: {} as SignUpContinueSchema,
}).createMachine({
  id: SignUpContinueMachineId,
  context: ({ input }) => ({
    basePath: input.basePath || SIGN_UP_DEFAULT_BASE_PATH,
    formRef: input.form,
    parent: input.parent,
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
      invoke: {
        id: 'attempt',
        src: 'attempt',
        input: ({ context }) => ({
          parent: context.parent,
          fields: context.formRef.getSnapshot().context.fields,
        }),
        onDone: {
          actions: sendParent(({ event }) => ({ type: 'NEXT', resource: event.output })),
        },
        onError: {
          actions: 'setFormErrors',
          target: 'Pending',
        },
      },
    },
  },
});
