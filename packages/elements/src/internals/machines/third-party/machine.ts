import { assertEvent, log, sendParent, setup } from 'xstate';

import { assertActorEventError } from '~/internals/machines/utils/assert';
import { getEnabledThirdPartyProviders } from '~/utils/third-party-strategies';

import { handleRedirectCallback, signInRedirect, signUpRedirect } from './actors';
import type { ThirdPartyMachineSchema } from './types';

export const ThirdPartyMachine = setup({
  actors: {
    handleRedirectCallback,
    signInRedirect,
    signUpRedirect,
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
  types: {} as ThirdPartyMachineSchema,
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
