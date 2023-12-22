import { type ClerkAPIResponseError, isClerkAPIResponseError } from '@clerk/shared/error';
import type { LoadedClerk, SignInResource } from '@clerk/types';
import { assign, setup } from 'xstate';

import type { ClerkHostRouter } from '../router';
import { waitForClerk } from './shared.actors';
import {
  attemptFirstFactor,
  attemptSecondFactor,
  createSignIn,
  prepareFirstFactor,
  prepareSecondFactor,
} from './sign-in.actors';
import type { FieldDetails } from './sign-in.types';

export interface SignInMachineContext {
  clerk: LoadedClerk;
  router: ClerkHostRouter;
  error?: Error | ClerkAPIResponseError;
  resource?: SignInResource;
  fields: Map<string, FieldDetails>;
}

export interface SignInMachineInput {
  clerk: LoadedClerk;
  router: ClerkHostRouter;
}

export type SignInMachineEvents =
  | { type: 'START' }
  | { type: 'SUBMIT' }
  | { type: 'NEXT' }
  | { type: 'RETRY' }
  | { type: 'FIELD.ADD'; field: Pick<FieldDetails, 'type' | 'value'> }
  | { type: 'FIELD.REMOVE'; field: Pick<FieldDetails, 'type'> }
  | {
      type: 'FIELD.UPDATE';
      field: Pick<FieldDetails, 'type' | 'value'>;
    }
  | {
      type: 'FIELD.ERROR';
      field: Pick<FieldDetails, 'type' | 'error'>;
    };

export const STATES = {
  Init: 'Init',

  Start: 'Start',
  StartAttempting: 'StartAttempting',
  StartFailure: 'StartFailure',

  FirstFactor: 'FirstFactor',
  FirstFactorPreparing: 'FirstFactorPreparing',
  FirstFactorIdle: 'FirstFactorIdle',
  FirstFactorAttempting: 'FirstFactorAttempting',
  FirstFactorFailure: 'FirstFactorFailure',

  SecondFactor: 'SecondFactor',
  SecondFactorPreparing: 'SecondFactorPreparing',
  SecondFactorIdle: 'SecondFactorIdle',
  SecondFactorAttempting: 'SecondFactorAttempting',
  SecondFactorFailure: 'SecondFactorFailure',

  Complete: 'Complete',
} as const;

function eventHasError<T = any>(value: T): value is T & { error: Error } {
  // @ts-expect-error - TODO: fix
  return value.error instanceof Error;
}

export const SignInMachine = setup({
  actors: {
    waitForClerk,
    createSignIn,
    prepareFirstFactor,
    attemptFirstFactor,
    prepareSecondFactor,
    attemptSecondFactor,
    // authenticateWithRedirect,
  },
  actions: {
    assignResourceToContext: assign({
      // @ts-expect-error - TODO: fix types
      resource: ({ event }) => event.output,
    }),

    assignErrorMessageToContext: assign({
      error: ({ context, event }) => (eventHasError(event) ? event.error : context.error),
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
  initial: STATES.Init,
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
  },
  states: {
    [STATES.Init]: {
      invoke: {
        src: 'waitForClerk',
        input: ({ context }) => context.clerk,
        onDone: {
          target: STATES.Start,
          actions: assign({
            // @ts-expect-error -- this is really IsomorphicClerk up to this point
            clerk: ({ context }) => context.clerk.clerkjs,
          }),
        },
      },
    },
    [STATES.Start]: {
      entry: ({ context }) => console.log('Start entry: ', context),
      on: {
        SUBMIT: {
          target: STATES.StartAttempting,
        },
      },
    },
    [STATES.StartAttempting]: {
      entry: ({ context }) => console.log('StartAttempting entry: ', context),
      invoke: {
        src: 'createSignIn',
        input: ({ context }) => ({
          client: context.clerk.client,
          fields: context.fields,
        }),
        onDone: { actions: 'assignResourceToContext' },
        onError: {
          target: STATES.StartFailure,
          actions: 'assignErrorMessageToContext',
        },
      },
      always: [
        {
          guard: ({ context }) => context?.resource?.status === 'complete',
          target: STATES.Complete,
        },
        {
          guard: ({ context }) => context?.resource?.status === 'needs_first_factor',
          target: STATES.FirstFactor,
        },
      ],
    },
    [STATES.StartFailure]: {
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
          target: STATES.Start,
        },
      ],
    },
    [STATES.FirstFactor]: {
      always: 'FirstFactorPreparing',
    },
    [STATES.FirstFactorPreparing]: {
      invoke: {
        id: 'prepareFirstFactor',
        src: 'prepareFirstFactor',
        // @ts-expect-error - TODO: Implement
        input: ({ context }) => ({
          client: context.clerk.client,
          params: {},
        }),
        onDone: {
          target: STATES.FirstFactor,
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
          target: STATES.Start,
          actions: ['assignErrorMessageToContext'],
        },
      },
    },
    [STATES.FirstFactorIdle]: {
      on: {
        SUBMIT: {
          // guard: ({ context }) => !!context.resource,
          target: STATES.FirstFactorAttempting,
        },
      },
    },
    [STATES.FirstFactorAttempting]: {
      invoke: {
        id: 'prepareFirstFactor',
        src: 'prepareFirstFactor',
        // @ts-expect-error - TODO: Implement
        input: ({ context }) => ({
          client: context.clerk.client,
          params: {},
        }),
        onDone: {
          target: STATES.FirstFactor,
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
          target: STATES.FirstFactorIdle,
          actions: 'assignErrorMessageToContext',
        },
      },
    },
    [STATES.FirstFactorFailure]: {
      always: [
        {
          guard: 'hasClerkAPIError',
          target: STATES.FirstFactorIdle,
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
    [STATES.SecondFactor]: {
      always: STATES.SecondFactorPreparing,
    },
    [STATES.SecondFactorPreparing]: {
      invoke: {
        id: 'prepareSecondFactor',
        src: 'prepareSecondFactor',
        // @ts-expect-error - TODO: Implement
        input: ({ context }) => ({
          client: context.clerk.client,
          params: {},
        }),
        onDone: {
          target: STATES.SecondFactorIdle,
          actions: ['assignResourceToContext'],
        },
        onError: {
          target: STATES.SecondFactorIdle,
          actions: ['assignErrorMessageToContext'],
        },
      },
    },
    [STATES.SecondFactorIdle]: {
      on: {
        RETRY: 'SecondFactorPreparing',
        SUBMIT: {
          // guard: ({ context }) => !!context.resource,
          target: STATES.SecondFactorAttempting,
        },
      },
    },
    [STATES.SecondFactorAttempting]: {
      invoke: {
        id: 'prepareFirstFactor',
        src: 'prepareFirstFactor',
        // @ts-expect-error - TODO: Implement
        input: ({ context }) => ({
          client: context.clerk.client,
          params: {},
        }),
        onDone: {
          target: STATES.SecondFactorIdle,
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
          target: STATES.SecondFactorIdle,
          actions: ['assignErrorMessageToContext'],
        },
      },
      [STATES.SecondFactorFailure]: {
        always: [
          {
            guard: 'hasClerkAPIError',
            target: STATES.SecondFactorIdle,
          },
          { target: STATES.Complete },
        ],
      },
    },
    [STATES.Complete]: {
      type: 'final',
      entry: ({ context }) => {
        const beforeEmit = () => context.router.push(context.clerk.buildAfterSignInUrl());
        void context.clerk.setActive({ session: context.resource?.createdSessionId, beforeEmit });
      },
    },
  },
});
