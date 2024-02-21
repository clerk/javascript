import type { SignUpResource } from '@clerk/types';
import { fromPromise, sendParent, sendTo, setup } from 'xstate';

import { SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import type { FormFields } from '~/internals/machines/form/form.types';
import type { WithClient } from '~/internals/machines/shared.types';
import type { SignUpStartSchema } from '~/internals/machines/sign-up/types';
import { fieldsToSignUpParams } from '~/internals/machines/sign-up/utils';
import { ThirdPartyMachine } from '~/internals/machines/third-party/machine';
import { assertActorEventError } from '~/internals/machines/utils/assert';

export type TSignUpStartMachine = typeof SignUpStartMachine;

export const SignUpStartMachineId = 'SignUpStart';

export const SignUpStartMachine = setup({
  actors: {
    attempt: fromPromise<SignUpResource, WithClient<{ fields: FormFields }>>(({ input: { client, fields } }) => {
      const params = fieldsToSignUpParams(fields);
      return client.signUp.create(params);
    }),
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
    clerk: input.clerk,
    formRef: input.form,
    routerRef: input.router,
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
        id: 'attemptCreate',
        src: 'attempt',
        input: ({ context }) => ({
          client: context.clerk.client,
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
