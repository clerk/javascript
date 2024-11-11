import { assertEvent, assign, log, not, sendTo, setup } from 'xstate';

import { sendToLoading } from '~/internals/machines/shared';
import { assertActorEventError } from '~/internals/machines/utils/assert';

import { handleRedirectCallback, redirect } from './third-party.actors';
import type { ThirdPartyMachineSchema } from './third-party.types';

export const ThirdPartyMachineId = 'ThirdParty';

export type TThirdPartyMachine = typeof ThirdPartyMachine;

export const ThirdPartyMachine = setup({
  actors: {
    handleRedirectCallback,
    redirect,
  },
  actions: {
    logError: log(({ event }) => `Error: ${event.type}`),
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
  guards: {
    isExampleMode: ({ context }) => Boolean(context.parent.getSnapshot().context.exampleMode),
  },
  types: {} as ThirdPartyMachineSchema,
}).createMachine({
  id: ThirdPartyMachineId,
  context: ({ input }) => ({
    activeStrategy: null,
    basePath: input.basePath,
    formRef: input.formRef,
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
          guard: not('isExampleMode'),
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

          const legalAcceptedField = context.formRef.getSnapshot().context.fields.get('legalAccepted')?.checked;

          return {
            basePath: context.basePath,
            flow: context.flow,
            params: {
              ...event.params,
              legalAccepted: legalAcceptedField || undefined,
            },
            parent: context.parent,
          };
        },
        onError: {
          actions: 'setFormErrors',
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
          actions: ['logError', 'setFormErrors'],
          target: 'Idle',
        },
      },
      on: {
        'CLERKJS.NAVIGATE.*': {
          actions: 'sendToNext',
          target: 'Idle',
        },
      },
    },
  },
});
