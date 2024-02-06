import { assertEvent, assign, enqueueActions, log, sendParent, setup } from 'xstate';

import { assertActorEventError } from '~/internals/machines/utils/assert';
import { getEnabledThirdPartyProviders } from '~/utils/third-party-strategies';

import { handleRedirectCallback, redirect } from './actors';
import type { ThirdPartyMachineSchema } from './types';

const THIRD_PARTY_MACHINE_ID = 'ThirdParty';

const machine = setup({
  actors: {
    handleRedirectCallback,
    redirect,
  },
  actions: {
    logError: log(({ event }) => `Error: ${event.type}`),
    reportError: ({ event }) => {
      assertActorEventError(event);
      sendParent({
        type: 'FAILURE',
        error: event.error,
      });
    },
    assignActiveStrategy: assign({
      activeStrategy: ({ event }) => {
        assertEvent(event, 'REDIRECT');
        return event.params.strategy;
      },
    }),
    assignThirdPartyProviders: assign(({ context }) => ({
      thirdPartyProviders: getEnabledThirdPartyProviders(context.clerk.__unstable__environment),
    })),
    unassignActiveStrategy: assign({
      activeStrategy: null,
    }),
  },
  guards: {
    hasThirdPartyProviders: ({ context }) => Boolean(context.thirdPartyProviders?.authenticatableOauthStrategies),
  },
  types: {} as ThirdPartyMachineSchema,
}).createMachine({
  id: THIRD_PARTY_MACHINE_ID,
  context: ({ input }) => ({
    activeStrategy: null,
    basePath: input.basePath,
    clerk: input.clerk,
    flow: input.flow,
    thirdPartyProviders: getEnabledThirdPartyProviders(input.clerk.__unstable__environment),
  }),
  initial: 'Idle',
  states: {
    Idle: {
      description: 'Sets third-party providers if not already set, and waits for a redirect or callback event',
      entry: enqueueActions(({ check, enqueue }) => {
        if (!check('hasThirdPartyProviders')) {
          enqueue('assignThirdPartyProviders');
        }
      }),
      on: {
        CALLBACK: 'HandlingCallback',
        REDIRECT: {
          target: 'Redirecting',
          reenter: true,
        },
      },
    },
    Redirecting: {
      description: 'Redirects to the third-party provider for authentication',
      tags: ['state:redirect', 'loading'],
      entry: 'assignActiveStrategy',
      exit: 'unassignActiveStrategy',
      invoke: {
        id: 'redirect',
        src: 'redirect',
        input: ({ context, event }) => {
          assertEvent(event, 'REDIRECT');

          return {
            basePath: context.basePath,
            clerk: context.clerk,
            flow: context.flow,
            params: event.params,
          };
        },
        onError: {
          actions: 'reportError',
          target: 'Idle',
        },
      },
    },
    HandlingCallback: {
      description: 'Handles the callback from the third-party provider',
      tags: ['state:callback', 'loading'],
      invoke: {
        id: 'handleRedirectCallback',
        src: 'handleRedirectCallback',
        input: ({ context }) => context.clerk,
        onError: {
          actions: ['logError', 'reportError'],
          target: 'Idle',
        },
      },
      on: {
        'CLERKJS.NAVIGATE.*': {
          actions: sendParent(({ event }) => {
            switch (event.type) {
              case 'CLERKJS.NAVIGATE.SIGN_IN':
              case 'CLERKJS.NAVIGATE.SIGN_UP':
                return event;
              case 'CLERKJS.NAVIGATE.VERIFICATION':
                return { type: 'CLERKJS.NAVIGATE.SIGN_UP' };
              default:
                return { type: 'NEXT' };
            }
          }),
          target: 'Idle',
        },
      },
    },
  },
});

export { THIRD_PARTY_MACHINE_ID, machine as ThirdPartyMachine };
