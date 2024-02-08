import type { SignUpResource } from '@clerk/types';
import { assertEvent, fromPromise, sendParent, sendTo, setup } from 'xstate';

import { SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import type { FormFields } from '~/internals/machines/form/form.types';
import type { WithClient } from '~/internals/machines/shared.types';
import type { SignUpStartSchema } from '~/internals/machines/sign-up/types';
import { fieldsToSignUpParams } from '~/internals/machines/sign-up/utils';
import { THIRD_PARTY_MACHINE_ID, ThirdPartyMachine } from '~/internals/machines/third-party/machine';
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
    initiateOauthRedirect: sendTo(THIRD_PARTY_MACHINE_ID, ({ context, event }) => {
      assertEvent(event, 'AUTHENTICATE.OAUTH');

      return {
        type: 'REDIRECT',
        params: {
          strategy: event.strategy,
          redirectUrl: context.clerk.buildUrlWithAuth(`${context.basePath}/sso-callback`),
          redirectUrlComplete: context.clerk.buildUrlWithAuth(`${context.basePath}/sso-callback`),
        },
      };
    }),
    initiateSamlRedirect: sendTo(THIRD_PARTY_MACHINE_ID, {
      type: 'REDIRECT',
      params: { strategy: 'saml' },
    }),
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
  invoke: [
    {
      id: THIRD_PARTY_MACHINE_ID,
      systemId: THIRD_PARTY_MACHINE_ID,
      src: 'thirdParty',
      input: ({ context }) => ({
        basePath: context.basePath,
        clerk: context.clerk,
        flow: 'signUp',
      }),
    },
  ],
  states: {
    Pending: {
      tags: ['state:pending'],
      description: 'Waiting for user input',
      on: {
        'AUTHENTICATE.OAUTH': {
          actions: 'initiateOauthRedirect',
        },
        'AUTHENTICATE.SAML': {
          actions: 'initiateSamlRedirect',
        },
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
