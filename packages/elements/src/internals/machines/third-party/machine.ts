import type { LoadedClerk } from '@clerk/types';
import { assertEvent, assign, log, sendParent, setup } from 'xstate';

import { SSO_CALLBACK_PATH_ROUTE } from '~/internals/constants';
import { sendToLoading } from '~/internals/machines/shared.actions';
import { assertActorEventError } from '~/internals/machines/utils/assert';

import { handleRedirectCallback, redirect } from './actors';
import type { ThirdPartyMachineSchema } from './types';

export const ThirdPartyMachineId = 'ThirdParty';

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
    unassignActiveStrategy: assign({
      activeStrategy: null,
    }),
    sendToNext: ({ context }) => context.parent.send({ type: 'NEXT' }),
    sendToLoading,
  },
  types: {} as ThirdPartyMachineSchema,
}).createMachine({
  id: ThirdPartyMachineId,
  context: ({ input }) => ({
    activeStrategy: null,
    basePath: input.basePath,
    flow: input.flow,
    parent: input.parent,
    loadingStep: 'strategy',
  }),
  initial: 'Idle',
  states: {
    Idle: {
      description: 'Sets third-party providers if not already set, and waits for a redirect or callback event',
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
      entry: ['assignActiveStrategy', 'sendToLoading'],
      exit: ['unassignActiveStrategy', 'sendToLoading'],
      invoke: {
        id: 'redirect',
        src: 'redirect',
        input: ({ context, event }) => {
          assertEvent(event, 'REDIRECT');

          const clerk: LoadedClerk = context.parent.getSnapshot().context.clerk;

          const redirectUrl =
            event.params.redirectUrl || clerk.buildUrlWithAuth(`${context.basePath}${SSO_CALLBACK_PATH_ROUTE}`);
          const redirectUrlComplete = event.params.redirectUrlComplete || redirectUrl;

          return {
            basePath: context.basePath,
            flow: context.flow,
            params: {
              redirectUrl,
              redirectUrlComplete,
              ...event.params,
            },
            parent: context.parent,
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
        input: ({ context }) => context.parent,
        onError: {
          actions: ['logError', 'reportError'],
          target: 'Idle',
        },
      },
      on: {
        'CLERKJS.NAVIGATE.*': {
          actions: 'sendToNext',
        },
      },
    },
  },
});
