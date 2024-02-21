import { assertEvent, assign, enqueueActions, log, sendParent, setup } from 'xstate';

import { SSO_CALLBACK_PATH_ROUTE } from '~/internals/constants';
import { assertActorEventError } from '~/internals/machines/utils/assert';
import { getEnabledThirdPartyProviders } from '~/utils/third-party-strategies';

import { handleRedirectCallback, redirect } from './actors';
import type { ThirdPartyMachineSchema } from './types';

export const ThirdPartyMachineId: string = 'ThirdParty';

export type TThirdPartyMachine = typeof ThirdPartyMachine;

export const ThirdPartyMachine = setup({
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
  id: ThirdPartyMachineId,
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
      tags: ['state:redirect', 'state:loading'],
      entry: 'assignActiveStrategy',
      exit: 'unassignActiveStrategy',
      invoke: {
        id: 'redirect',
        src: 'redirect',
        input: ({ context, event }) => {
          assertEvent(event, 'REDIRECT');

          const redirectUrl =
            event.params.redirectUrl || context.clerk.buildUrlWithAuth(`${context.basePath}${SSO_CALLBACK_PATH_ROUTE}`);
          const redirectUrlComplete = event.params.redirectUrlComplete || redirectUrl;

          return {
            basePath: context.basePath,
            clerk: context.clerk,
            flow: context.flow,
            params: {
              redirectUrl,
              redirectUrlComplete,
              ...event.params,
            },
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
      tags: ['state:callback', 'state:loading'],
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
          actions: sendParent(({ context }) => ({
            type: 'NEXT',
            resource: context.clerk.client[context.flow],
          })),
        },
      },
    },
  },
});
