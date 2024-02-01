import type { AuthenticateWithRedirectParams, LoadedClerk } from '@clerk/types';
import type { SetOptional } from 'type-fest';
import type { AnyStateMachine, MachineContext } from 'xstate';
import { assertEvent, fromPromise, log, sendParent, setup } from 'xstate';

import { SSO_CALLBACK_PATH_ROUTE } from '~/internals/constants';
import { handleRedirectCallback } from '~/internals/machines/shared.actors';
import type { WithClerk, WithParams, WithUnsafeMetadata } from '~/internals/machines/shared.types';
import { assertActorEventError } from '~/internals/machines/utils/assert';
import type { ClerkJSNavigationEvent } from '~/internals/machines/utils/clerkjs';
import type { EnabledThirdPartyProviders } from '~/utils/third-party-strategies';
import { getEnabledThirdPartyProviders } from '~/utils/third-party-strategies';

export interface ThirdPartyContext extends MachineContext {
  clerk: LoadedClerk;
  thirdPartyProviders: EnabledThirdPartyProviders;
}

export interface ThirdPartyInput {
  clerk: LoadedClerk;
  parent: AnyStateMachine;
}

export type RedirectEventType = 'REDIRECT.SIGN_IN' | 'REDIRECT.SIGN_UP';

export type ThirdPartyEvents =
  | { type: RedirectEventType; params: AuthenticateWithRedirectParams }
  | { type: 'REDIRECT.CALLBACK' }
  | { type: ClerkJSNavigationEvent };

export interface ThirdPartySchema {
  context: ThirdPartyContext;
  input: ThirdPartyInput;
  events: ThirdPartyEvents;
}

type OptionalRedirectParams = 'redirectUrl' | 'redirectUrlComplete';

export type AuthenticateWithRedirectSignInParams = SetOptional<AuthenticateWithRedirectParams, OptionalRedirectParams>;
export type AuthenticateWithRedirectSignUpParams = SetOptional<
  WithUnsafeMetadata<AuthenticateWithRedirectParams>,
  OptionalRedirectParams
>;

export type AuthenticateWithRedirectSignInInput = WithClerk<WithParams<AuthenticateWithRedirectSignInParams>>;
export type AuthenticateWithRedirectSignUpInput = WithClerk<WithParams<AuthenticateWithRedirectSignUpParams>>;

export const ThirdPartyMachine = setup({
  actors: {
    handleRedirectCallback,
    signInRedirect: fromPromise<void, AuthenticateWithRedirectSignInInput>(async ({ input: { clerk, params } }) =>
      clerk.client.signIn.authenticateWithRedirect({
        redirectUrl: params.redirectUrl || clerk.buildUrlWithAuth(`/sign-up${SSO_CALLBACK_PATH_ROUTE}`),
        redirectUrlComplete: params.redirectUrlComplete || clerk.buildAfterSignInUrl(),
        ...params,
      }),
    ),
    signUpRedirect: fromPromise<void, AuthenticateWithRedirectSignUpInput>(async ({ input: { clerk, params } }) =>
      clerk.client.signUp.authenticateWithRedirect({
        redirectUrl: params.redirectUrl || clerk.buildUrlWithAuth(`/sign-up${SSO_CALLBACK_PATH_ROUTE}`),
        redirectUrlComplete: params.redirectUrlComplete || clerk.buildAfterSignUpUrl(),
        ...params,
      }),
    ),
  },
  actions: {
    logError: log(({ event }) => `Error: ${event.type}, `),
    reportError: ({ event }) => {
      assertActorEventError(event);

      sendParent({
        type: 'FAILURE',
        error: event.error,
      });
    },
    reportCallbackStatus: ({ event }) => {
      switch (event.type) {
        case 'CLERKJS.NAVIGATE.SIGN_IN':
        case 'CLERKJS.NAVIGATE.SIGN_UP':
        case 'CLERKJS.NAVIGATE.VERIFICATION':
          return sendParent(event);
        default:
          return sendParent({ type: 'NEXT' });
      }
    },
  },
  types: {} as ThirdPartySchema,
}).createMachine({
  id: 'ThirdParty',
  context: ({ input }) => ({
    clerk: input.clerk,
    thirdPartyProviders: getEnabledThirdPartyProviders(input.clerk.__unstable__environment),
  }),
  initial: 'Idle',
  states: {
    Idle: {
      on: {
        'REDIRECT.SIGN_IN': 'RedirectingSignIn',
        'REDIRECT.SIGN_UP': 'RedirectingSignUp',
        'REDIRECT.CALLBACK': 'HandlingCallback',
      },
    },
    RedirectingSignIn: {
      tags: 'redirect',
      invoke: {
        id: 'signInRedirect',
        src: 'signInRedirect',
        input: ({ context, event }) => {
          assertEvent(event, 'REDIRECT.SIGN_IN');

          return {
            clerk: context.clerk,
            params: event.params,
          };
        },
        onError: {
          actions: 'reportError',
          target: '#ThirdParty.Idle',
        },
      },
    },
    RedirectingSignUp: {
      tags: 'redirect',
      invoke: {
        id: 'signUpRedirect',
        src: 'signUpRedirect',
        input: ({ context, event }) => {
          assertEvent(event, 'REDIRECT.SIGN_UP');

          return {
            clerk: context.clerk,
            params: event.params,
          };
        },
        onError: {
          actions: 'reportError',
          target: '#ThirdParty.Idle',
        },
      },
    },
    HandlingCallback: {
      tags: 'callback',
      on: {
        'CLERKJS.NAVIGATE.*': {
          actions: 'reportCallbackStatus',
        },
      },
      invoke: {
        id: 'handleRedirectCallback',
        src: 'handleRedirectCallback',
        input: ({ context }) => context.clerk,
        onError: {
          actions: ['logError', 'reportError'],
          target: '#ThirdParty.Idle',
        },
      },
    },
  },
});
