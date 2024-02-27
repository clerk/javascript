import { snakeToCamel } from '@clerk/shared';
import type { SignUpResource } from '@clerk/types';
import type { ActorRefFrom } from 'xstate';
import { fromPromise, sendParent, setup } from 'xstate';

import { SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import type { FormDefaultValues, FormFields } from '~/internals/machines/form/form.types';
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
    setFormErrors: ({ context, event }) => {
      assertActorEventError(event);
      context.formRef.send({
        type: 'ERRORS.SET',
        error: event.error,
      });
    },
    markFormAsProgressive: ({ context }) => {
      const signUp = context.parent.getSnapshot().context.clerk.client.signUp;

      const missing = signUp.missingFields.map(snakeToCamel);
      const optional = signUp.optionalFields.map(snakeToCamel);
      const required = signUp.requiredFields.map(snakeToCamel);

      const progressiveFieldValues: FormDefaultValues = new Map();

      for (const key of required.concat(optional) as (keyof SignUpResource)[]) {
        if (key in signUp) {
          // @ts-expect-error - TS doesn't understand that key is a valid key of SignUpResource
          progressiveFieldValues.set(key, signUp[key]);
        }
      }

      context.formRef.send({
        type: 'MARK_AS_PROGRESSIVE',
        missing,
        optional,
        required,
        defaultValues: progressiveFieldValues,
      });
    },
    unmarkFormAsProgressive: ({ context }) => context.formRef.send({ type: 'UNMARK_AS_PROGRESSIVE' }),
  },
  types: {} as SignUpContinueSchema,
}).createMachine({
  id: SignUpContinueMachineId,
  context: ({ input }) => ({
    basePath: input.basePath || SIGN_UP_DEFAULT_BASE_PATH,
    formRef: input.form,
    parent: input.parent,
  }),
  entry: 'markFormAsProgressive',
  onDone: {
    actions: 'unmarkFormAsProgressive',
  },
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
