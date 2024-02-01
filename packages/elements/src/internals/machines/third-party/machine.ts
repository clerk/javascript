import { assertEvent, assign, log, sendParent, setup } from 'xstate';

import { assertActorEventError } from '~/internals/machines/utils/assert';
import { getEnabledThirdPartyProviders } from '~/utils/third-party-strategies';

import { handleRedirectCallback, signInRedirect, signUpRedirect } from './actors';
import type { ThirdPartyMachineSchema } from './types';

const THIRD_PARTY_MACHINE_ID = 'ThirdParty';

const machine = setup({
  actors: {
    handleRedirectCallback,
    signInRedirect,
    signUpRedirect,
  },
  actions: {
    assignThirdPartyProviders: assign({
      thirdPartyProviders: ({ context }) => getEnabledThirdPartyProviders(context.clerk.__unstable__environment),
    }),
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
  id: THIRD_PARTY_MACHINE_ID,
  context: ({ input }) => ({
    clerk: input.clerk,
    thirdPartyProviders: getEnabledThirdPartyProviders(input.clerk.__unstable__environment),
  }),
  initial: 'Idle',
  states: {
    Idle: {
      entry: 'assignThirdPartyProviders',
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

export { THIRD_PARTY_MACHINE_ID, machine as ThirdPartyMachine };
