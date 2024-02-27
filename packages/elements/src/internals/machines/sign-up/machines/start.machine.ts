import type { SignUpResource } from '@clerk/types';
import type { ActorRefFrom } from 'xstate';
import { fromPromise, sendParent, sendTo, setup } from 'xstate';

import { SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import type { FormFields } from '~/internals/machines/form/form.types';
import type { TSignUpRouterMachine } from '~/internals/machines/sign-up/machines';
import type { SignUpStartSchema } from '~/internals/machines/sign-up/types';
import { fieldsToSignUpParams } from '~/internals/machines/sign-up/utils';
import { ThirdPartyMachine } from '~/internals/machines/third-party/machine';
import { assertActorEventError } from '~/internals/machines/utils/assert';

export type TSignUpStartMachine = typeof SignUpStartMachine;

export const SignUpStartMachineId = 'SignUpStart';

export const SignUpStartMachine = setup({
  actors: {
    attempt: fromPromise<SignUpResource, { parent: ActorRefFrom<TSignUpRouterMachine>; fields: FormFields }>(
      ({ input: { fields, parent } }) => {
        const params = fieldsToSignUpParams(fields);
        return parent.getSnapshot().context.clerk.client.signUp.create(params);
      },
    ),
    thirdParty: ThirdPartyMachine,
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
  types: {} as SignUpStartSchema,
}).createMachine({
  id: SignUpStartMachineId,
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
        SUBMIT: 'Attempting',
      },
    },
    Attempting: {
      tags: ['state:attempting', 'state:loading'],
      invoke: {
        id: 'attemptCreate',
        src: 'attempt',
        input: ({ context }) => ({
          parent: context.parent,
          fields: context.formRef.getSnapshot().context.fields,
        }),
        onDone: {
          actions: sendParent({ type: 'NEXT' }),
        },
        onError: {
          actions: 'setFormErrors',
          target: 'Pending',
        },
      },
    },
  },
});
