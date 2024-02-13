import type { ClientResource, SignInResource } from '@clerk/types';
import { assertEvent, fromPromise, sendParent, sendTo, setup } from 'xstate';

import { SIGN_IN_DEFAULT_BASE_PATH, SSO_CALLBACK_PATH_ROUTE } from '~/internals/constants';
import type { FormFields } from '~/internals/machines/form/form.types';
import type { SignInStartSchema } from '~/internals/machines/sign-in/types';
import { THIRD_PARTY_MACHINE_ID, ThirdPartyMachine } from '~/internals/machines/third-party/machine';
import { assertActorEventError } from '~/internals/machines/utils/assert';

export type TSignInStartMachine = typeof SignInStartMachine;

export const SignInStartMachineId = 'SignInStart';

export const SignInStartMachine = setup({
  actors: {
    attempt: fromPromise<SignInResource, { client: ClientResource; fields: FormFields }>(
      ({ input: { client, fields } }) => {
        const password = fields.get('password');
        const identifier = fields.get('identifier');

        const passwordParams = password?.value
          ? {
              password: password.value,
              strategy: 'password',
            }
          : {};

        return client.signIn.create({
          identifier: identifier?.value as string,
          ...passwordParams,
        });
      },
    ),
    thirdParty: ThirdPartyMachine,
  },
  actions: {
    initiateOauthRedirect: sendTo(THIRD_PARTY_MACHINE_ID, ({ context, event }) => {
      assertEvent(event, 'AUTHENTICATE.OAUTH');

      return {
        type: 'REDIRECT',
        params: {
          strategy: event.strategy,
          redirectUrl: context.clerk.buildUrlWithAuth(`${context.basePath}${SSO_CALLBACK_PATH_ROUTE}`),
          redirectUrlComplete: context.clerk.buildUrlWithAuth(`${context.basePath}${SSO_CALLBACK_PATH_ROUTE}`),
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
  types: {} as SignInStartSchema,
}).createMachine({
  id: SignInStartMachineId,
  context: ({ input }) => ({
    basePath: input.basePath || SIGN_IN_DEFAULT_BASE_PATH,
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
        flow: 'signIn',
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
        id: 'attempt',
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
