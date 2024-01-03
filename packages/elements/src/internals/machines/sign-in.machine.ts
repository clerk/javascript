import { type ClerkAPIResponseError, isClerkAPIResponseError } from '@clerk/shared/error';
import type { OAuthStrategy, SignInResource, Web3Strategy } from '@clerk/types';
import type { DoneActorEvent, DoneStateEvent, ErrorActorEvent } from 'xstate';
import { assertEvent, assign, setup } from 'xstate';

import type { EnabledThirdPartyProviders } from '../../utils/third-party-strategies';
import { getEnabledThirdPartyProviders } from '../../utils/third-party-strategies';
import type { ClerkRouter } from '../router';
import { waitForClerk } from './shared.actors';
import * as signInActors from './sign-in.actors';
import type { FieldDetails, LoadedClerkWithEnv } from './sign-in.types';
import { assertActorEventDone, assertActorEventError } from './utils/assert';
import { goToChildState } from './utils/states';

export interface SignInMachineContext {
  clerk: LoadedClerkWithEnv;
  enabledThirdPartyProviders?: EnabledThirdPartyProviders;
  error?: Error | ClerkAPIResponseError;
  fields: Map<string, FieldDetails>;
  resource?: SignInResource;
  router: ClerkRouter;
}

export interface SignInMachineInput {
  clerk: LoadedClerkWithEnv;
  router: ClerkRouter;
}

export type SignInMachineEvents =
  | DoneActorEvent
  | ErrorActorEvent
  | DoneStateEvent
  | { type: 'AUTHENTICATE.OAUTH'; strategy: OAuthStrategy }
  | { type: 'AUTHENTICATE.WEB3'; strategy: Web3Strategy }
  | { type: 'FIELD.ADD'; field: Pick<FieldDetails, 'type' | 'value'> }
  | { type: 'FIELD.REMOVE'; field: Pick<FieldDetails, 'type'> }
  | {
      type: 'FIELD.UPDATE';
      field: Pick<FieldDetails, 'type' | 'value'>;
    }
  | {
      type: 'FIELD.ERROR';
      field: Pick<FieldDetails, 'type' | 'error'>;
    }
  | { type: 'NEXT' }
  | { type: 'OAUTH.CALLBACK' }
  | { type: 'RETRY' }
  | { type: 'START' }
  | { type: 'SUBMIT' };

export const SignInMachine = setup({
  actors: {
    ...signInActors,
    waitForClerk,
  },
  actions: {
    assignResourceToContext: assign({
      resource: ({ event }) => {
        assertActorEventDone<SignInResource>(event);
        return event.output;
      },
    }),

    assignErrorMessageToContext: assign({
      error: ({ event }) => {
        assertActorEventError(event);
        return event.error;
      },
    }),

    navigateTo: ({ context }, { path }: { path: string }) => context.router.replace(path),

    clearFields: assign({
      fields: new Map(),
    }),
  },
  guards: {
    hasClerkAPIError: ({ context }) => isClerkAPIResponseError(context.error),
    hasClerkAPIErrorCode: ({ context }, params?: { code?: string }) =>
      params?.code
        ? isClerkAPIResponseError(context.error)
          ? Boolean(context.error.errors.find(e => e.code === params.code))
          : false
        : false,
  },
  types: {
    context: {} as SignInMachineContext,
    input: {} as SignInMachineInput,
    events: {} as SignInMachineEvents,
  },
}).createMachine({
  context: ({ input }) => ({
    clerk: input.clerk,
    router: input.router,
    currentFactor: null,
    fields: new Map(),
  }),
  initial: 'Init',
  on: {
    'FIELD.ADD': {
      actions: assign({
        fields: ({ context, event }) => {
          if (!event.field.type) throw new Error('Field type is required');

          context.fields.set(event.field.type, event.field);
          return context.fields;
        },
      }),
    },
    'FIELD.UPDATE': {
      actions: assign({
        fields: ({ context, event }) => {
          if (!event.field.type) throw new Error('Field type is required');

          if (context.fields.has(event.field.type)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            context.fields.get(event.field.type)!.value = event.field.value;
          }

          return context.fields;
        },
      }),
    },
    'FIELD.REMOVE': {
      actions: assign({
        fields: ({ context, event }) => {
          if (!event.field.type) throw new Error('Field type is required');

          context.fields.delete(event.field.type);
          return context.fields;
        },
      }),
    },
    'FIELD.ERROR': {
      actions: assign({
        fields: ({ context, event }) => {
          if (!event.field.type) throw new Error('Field type is required');

          if (context.fields.has(event.field.type)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            context.fields.get(event.field.type)!.error = event.field.error;
          }

          return context.fields;
        },
      }),
    },
    'OAUTH.CALLBACK': goToChildState('SSOCallbackRunning'),
  },
  states: {
    Init: {
      invoke: {
        src: 'waitForClerk',
        input: ({ context }) => context.clerk,
        onDone: {
          target: 'Start',
          actions: assign({
            // @ts-expect-error -- this is really IsomorphicClerk up to this point
            clerk: ({ context }) => context.clerk.clerkjs,
            enabledThirdPartyProviders: ({ context }) =>
              getEnabledThirdPartyProviders(context.clerk.__unstable__environment),
          }),
        },
      },
    },
    Start: {
      entry: ({ context }) => console.log('Start entry: ', context),
      on: {
        'AUTHENTICATE.OAUTH': 'InitiatingOAuthAuthentication',
        // 'AUTHENTICATE.WEB3': 'InitiatingWeb3Authentication',
        SUBMIT: 'StartAttempting',
      },
    },
    StartAttempting: {
      entry: () => console.log('StartAttempting'),
      invoke: {
        src: 'createSignIn',
        input: ({ context }) => ({
          client: context.clerk.client,
          fields: context.fields,
        }),
        onDone: { actions: 'assignResourceToContext' },
        onError: {
          target: 'StartFailure',
          actions: 'assignErrorMessageToContext',
        },
      },
      always: [
        {
          guard: ({ context }) => context?.resource?.status === 'complete',
          target: 'Complete',
        },
        {
          guard: ({ context }) => context?.resource?.status === 'needs_first_factor',
          target: 'FirstFactor',
        },
      ],
    },
    StartFailure: {
      entry: ({ context }) => console.log('StartFailure entry: ', context),
      always: [
        {
          guard: { type: 'hasClerkAPIErrorCode', params: { code: 'session_exists' } },
          actions: [
            {
              type: 'navigateTo',
              params: {
                path: '/',
              },
            },
          ],
        },
        {
          guard: 'hasClerkAPIError',
          target: 'Start',
        },
      ],
    },
    FirstFactor: {
      always: 'FirstFactorPreparing',
    },
    FirstFactorPreparing: {
      invoke: {
        id: 'prepareFirstFactor',
        src: 'prepareFirstFactor',
        // @ts-expect-error - TODO: Implement
        input: ({ context }) => ({
          client: context.clerk.client,
          params: {},
        }),
        onDone: {
          target: 'FirstFactor',
          actions: [
            'assignResourceToContext',
            {
              type: 'navigateTo',
              params: {
                path: '/sign-in/factor-one',
              },
            },
          ],
        },
        onError: {
          target: 'Start',
          actions: ['assignErrorMessageToContext'],
        },
      },
    },
    FirstFactorIdle: {
      on: {
        SUBMIT: {
          // guard: ({ context }) => !!context.resource,
          target: 'FirstFactorAttempting',
        },
      },
    },
    FirstFactorAttempting: {
      invoke: {
        id: 'prepareFirstFactor',
        src: 'prepareFirstFactor',
        // @ts-expect-error - TODO: Implement
        input: ({ context }) => ({
          client: context.clerk.client,
          params: {},
        }),
        onDone: {
          target: 'FirstFactor',
          actions: [
            'assignResourceToContext',
            {
              type: 'navigateTo',
              params: {
                path: '/sign-in/factor-one',
              },
            },
          ],
        },
        onError: {
          target: 'FirstFactorIdle',
          actions: 'assignErrorMessageToContext',
        },
      },
    },
    FirstFactorFailure: {
      always: [
        {
          guard: 'hasClerkAPIError',
          target: 'FirstFactorIdle',
        },
        {
          actions: {
            type: 'navigateTo',
            params: {
              path: '/sign-in/factor-one',
            },
          },
        },
      ],
    },
    SecondFactor: {
      always: 'SecondFactorPreparing',
    },
    SecondFactorPreparing: {
      invoke: {
        id: 'prepareSecondFactor',
        src: 'prepareSecondFactor',
        // @ts-expect-error - TODO: Implement
        input: ({ context }) => ({
          client: context.clerk.client,
          params: {},
        }),
        onDone: {
          target: 'SecondFactorIdle',
          actions: ['assignResourceToContext'],
        },
        onError: {
          target: 'SecondFactorIdle',
          actions: ['assignErrorMessageToContext'],
        },
      },
    },
    SecondFactorIdle: {
      on: {
        RETRY: 'SecondFactorPreparing',
        SUBMIT: {
          // guard: ({ context }) => !!context.resource,
          target: 'SecondFactorAttempting',
        },
      },
    },
    SecondFactorAttempting: {
      invoke: {
        id: 'prepareFirstFactor',
        src: 'prepareFirstFactor',
        // @ts-expect-error - TODO: Implement
        input: ({ context }) => ({
          client: context.clerk.client,
          params: {},
        }),
        onDone: {
          target: 'SecondFactorIdle',
          actions: [
            'assignResourceToContext',
            {
              type: 'navigateTo',
              params: {
                path: '/sign-in/factor-one',
              },
            },
          ],
        },
        onError: {
          target: 'SecondFactorIdle',
          actions: ['assignErrorMessageToContext'],
        },
      },
      SecondFactorFailure: {
        always: [
          {
            guard: 'hasClerkAPIError',
            target: 'SecondFactorIdle',
          },
          { target: 'Complete' },
        ],
      },
    },
    SSOCallbackRunning: {
      entry: () => console.log('StartAttempting'),
      invoke: {
        src: 'handleSSOCallback',
        input: ({ context }) => ({
          clerk: context.clerk,
          params: {
            firstFactorUrl: '../factor-one',
            secondFactorUrl: '../factor-two',
          },
          router: context.router,
        }),
        onDone: { actions: 'assignResourceToContext' },
        onError: {
          target: 'StartFailure',
          actions: 'assignErrorMessageToContext',
        },
      },
      always: [
        {
          guard: ({ context }) => context?.resource?.status === 'complete',
          target: 'Complete',
        },
        {
          guard: ({ context }) => context?.resource?.status === 'needs_first_factor',
          target: 'FirstFactor',
        },
      ],
    },
    InitiatingOAuthAuthentication: {
      entry: () => console.log('InitiatingOAuthAuthentication'),
      invoke: {
        src: 'authenticateWithRedirect',
        input: ({ context, event }) => {
          assertEvent(event, 'AUTHENTICATE.OAUTH');

          return {
            clerk: context.clerk,
            strategy: event.strategy,
          };
        },
        onError: {
          target: 'StartFailure',
          actions: 'assignErrorMessageToContext',
        },
      },
    },
    // InitiatingWeb3Authentication: {
    //   entry: () => console.log('InitiatingWeb3Authentication'),
    //   invoke: {
    //     src: 'authenticateWithMetamask',
    //     onError: {
    //       target: 'StartFailure',
    //       actions: 'assignErrorMessageToContext',
    //     },
    //   },
    // },
    Complete: {
      type: 'final',
      entry: ({ context }) => {
        const beforeEmit = () => context.router.push(context.clerk.buildAfterSignInUrl());
        void context.clerk.setActive({ session: context.resource?.createdSessionId, beforeEmit });
      },
    },
  },
});
