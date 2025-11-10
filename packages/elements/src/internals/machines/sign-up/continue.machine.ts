import type { SignUpResource } from '@clerk/shared/types';
import { snakeToCamel } from '@clerk/shared/underscore';
import type { DoneActorEvent } from 'xstate';
import { fromPromise, not, or, setup } from 'xstate';

import { SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import type { FormDefaultValues, FormFields } from '~/internals/machines/form';
import { sendToLoading } from '~/internals/machines/shared';
import { fieldsToSignUpParams } from '~/internals/machines/sign-up/utils';
import { assertActorEventError } from '~/internals/machines/utils/assert';

import type { SignUpContinueSchema } from './continue.types';
import type { SignInRouterMachineActorRef } from './router.types';

export type TSignUpContinueMachine = typeof SignUpContinueMachine;

export const SignUpContinueMachineId = 'SignUpContinue';

export const SignUpContinueMachine = setup({
  actors: {
    attempt: fromPromise<SignUpResource, { parent: SignInRouterMachineActorRef; fields: FormFields }>(
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
          progressiveFieldValues.set(key, signUp[key] as string | number | readonly string[] | undefined);
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
    sendToNext: ({ context, event }) =>
      context.parent.send({ type: 'NEXT', resource: (event as unknown as DoneActorEvent<SignUpResource>).output }),
    sendToLoading,
  },
  guards: {
    isStatusMissingRequirements: ({ context }) =>
      context.parent.getSnapshot().context.clerk?.client?.signUp?.status === 'missing_requirements',
    hasMetPreviousMissingRequirements: ({ context }) => {
      const signUp = context.parent.getSnapshot().context.clerk.client.signUp;

      const fields = context.formRef.getSnapshot().context.fields;
      const signUpMissingFields = signUp.missingFields.map(snakeToCamel);
      const missingFields = Array.from(context.formRef.getSnapshot().context.fields.keys()).filter(key => {
        return !signUpMissingFields.includes(key) && !fields.get(key)?.value && !fields.get(key)?.checked;
      });

      return missingFields.length === 0;
    },
  },
  types: {} as SignUpContinueSchema,
}).createMachine({
  id: SignUpContinueMachineId,
  context: ({ input }) => ({
    basePath: input.basePath || SIGN_UP_DEFAULT_BASE_PATH,
    formRef: input.formRef,
    parent: input.parent,
    loadingStep: 'continue',
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
        SUBMIT: {
          guard: or(['hasMetPreviousMissingRequirements', not('isStatusMissingRequirements')]),
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
