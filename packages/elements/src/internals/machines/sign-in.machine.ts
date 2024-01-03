import type { ClerkAPIResponseError } from '@clerk/shared/error';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { EnvironmentResource, OAuthStrategy, SignInResource, Web3Strategy } from '@clerk/types';
import type { MachineContext } from 'xstate';
import { and, assertEvent, assign, enqueueActions, log, not, raise, setup } from 'xstate';

import type { ClerkRouter } from '../router';
import { waitForClerk } from './shared.actors';
import * as signInActors from './sign-in.actors';
import type { FieldDetails, LoadedClerkWithEnv } from './sign-in.types';

export interface SignInMachineContext extends MachineContext {
  clerk: LoadedClerkWithEnv;
  environment?: EnvironmentResource;
  error?: Error | ClerkAPIResponseError;
  fields: Map<string, FieldDetails>;
  loaded: boolean;
  mode: 'browser' | 'server';
  resource: SignInResource | null;
  router: ClerkRouter;
}

export interface SignInMachineInput {
  clerk: LoadedClerkWithEnv;
  router: ClerkRouter;
}

export type SignInMachineEvents =
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
  | { type: 'SUBMIT' };

export type SignInTags = 'start' | 'first-factor' | 'second-factor' | 'complete';
export interface SignInMachineTypes {
  context: SignInMachineContext;
  input: SignInMachineInput;
  events: SignInMachineEvents;
  tags: SignInTags;
}

export const SignInMachine = setup({
  actors: {
    ...signInActors,
    waitForClerk,
  },
  actions: {
    debug: ({ context, event }, params?: Record<string, unknown>) => console.dir({ context, event, params }),
    navigateTo({ context }, { path }: { path: string }) {
      context.router.replace(path);
    },
    setAsActive: ({ context }) => {
      const beforeEmit = () => {
        return context.router.push(context.clerk.buildAfterSignInUrl());
      };
      void context.clerk.setActive({ session: context.resource?.createdSessionId, beforeEmit });
    },
  },
  guards: {
    isServer: ({ context }) => context.mode === 'server',
    isBrowser: ({ context }) => context.mode === 'browser',
    isClerkLoaded: ({ context }) => context.clerk.loaded,
    isClerkEnvironmentLoaded: ({ context }) => Boolean(context.clerk.__unstable__environment),
    isSignInComplete: ({ context }) => context?.resource?.status === 'complete',
    isLoggedIn: ({ context }) => Boolean(context.clerk.user),
    isSingleSessionMode: ({ context }) => Boolean(context.clerk.__unstable__environment?.authConfig.singleSessionMode),
    needsFirstFactor: ({ context }) => context.resource?.status === 'needs_first_factor',
    needsSecondFactor: ({ context }) => context.resource?.status === 'needs_second_factor',
    hasSignInResource: ({ context }) => Boolean(context.resource),
    hasClerkAPIError: ({ context }) => isClerkAPIResponseError(context.error),
    hasClerkAPIErrorCode: ({ context }, params?: { code?: string }) =>
      params?.code
        ? isClerkAPIResponseError(context.error)
          ? Boolean(context.error.errors.find(e => e.code === params.code))
          : false
        : false,
  },
  types: {} as SignInMachineTypes,
}).createMachine({
  id: 'SignIn',
  context: ({ input }) => {
    console.debug({ mode: input.clerk.mode, loaded: input.clerk.loaded });

    return {
      clerk: input.clerk,
      environment: input.clerk.__unstable__environment,
      mode: input.clerk.mode,
      loaded: input.clerk.loaded,
      router: input.router,
      resource: null,
      fields: new Map(),
    };
  },
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
    'OAUTH.CALLBACK': '#SignIn.SSOCallbackRunning',
  },
  initial: 'DeterminingState',
  states: {
    DeterminingState: {
      initial: 'Init',
      states: {
        Init: {
          always: [
            {
              description: 'If the SignIn resource is empty, invoke the sign-in start flow.',
              guard: 'isServer',
              target: 'Server',
            },
            {
              description: 'Wait for the Clerk instance to be ready.',
              guard: 'isBrowser',
              target: 'Browser',
            },
          ],
        },
        Server: {
          description: 'Determines the state of the sign-in flow on the server. This is a no-op for now.', // TODO: Implement
          entry: ['debug', log('Server no-op')],
        },
        Browser: {
          description: 'Determines the state of the sign-in flow on the browser.',
          always: [
            {
              description: 'Wait for the Clerk instance to be ready.',
              guard: not('isClerkLoaded'),
              target: '#SignIn.WaitingForClerk',
            },
            {
              description: 'If loggedin and single-session, invoke the sign-in start flow with error.',
              guard: and(['isLoggedIn', 'isSingleSessionMode']),
              actions: assign({ error: () => new Error('Already logged in.') }),
              target: '#SignIn.Start',
            },
            {
              description: 'If the SignIn resource is empty, invoke the sign-in start flow.',
              guard: not('hasSignInResource'),
              target: '#SignIn.Start',
            },
            {
              guard: 'isSignInComplete',
              target: '#SignIn.Complete',
            },
            {
              guard: 'needsFirstFactor',
              target: '#SignIn.FirstFactor',
            },
            {
              guard: 'needsSecondFactor',
              target: '#SignIn.SecondFactor',
            },
          ],
          exit: 'debug',
        },
      },
    },
    WaitingForClerk: {
      description: 'Waits for the Clerk instance to be ready.',
      invoke: {
        src: 'waitForClerk',
        input: ({ context }) => context.clerk,
        onDone: {
          target: 'DeterminingState',
          actions: assign({
            // @ts-expect-error -- this is really IsomorphicClerk up to this point
            clerk: ({ context }) => context.clerk.clerkjs,
            environment: ({ context }) => context.clerk.__unstable__environment,
            loaded: true,
          }),
        },
      },
    },
    Start: {
      description: 'The intial state of the sign-in flow.',
      initial: 'AwaitingInput',
      states: {
        AwaitingInput: {
          description: 'Waiting for user input',
          on: {
            'AUTHENTICATE.OAUTH': '#SignIn.InitiatingOAuthAuthentication',
            SUBMIT: 'Attempting',
          },
        },
        Attempting: {
          invoke: {
            id: 'createSignIn',
            src: 'createSignIn',
            input: ({ context }) => ({
              client: context.clerk.client,
              fields: context.fields,
            }),
            onDone: {
              actions: assign({
                resource: ({ event }) => event.output,
              }),
              target: 'Success',
            },
            onError: {
              actions: enqueueActions(({ enqueue, event }) => {
                if (isClerkAPIResponseError(event.error)) {
                  for (const error of event.error.errors) {
                    enqueue(() => console.debug(error));

                    if (error.meta?.paramName)
                      enqueue(
                        raise({
                          type: 'FIELD.ERROR',
                          field: {
                            type: error.meta.paramName,
                            error: error,
                          },
                        }),
                      );
                  }
                }
              }),
              target: 'AwaitingInput',
            },
          },
        },
        Success: {
          always: [
            {
              actions: 'setAsActive',
              guard: 'isSignInComplete',
            },
            {
              target: '#SignIn.DeterminingState',
            },
          ],
        },
      },
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
            assign({
              resource: ({ event }) => event.output,
            }),
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
          actions: assign({ error: ({ event }) => event.error as Error }),
        },
      },
    },
    FirstFactorIdle: {
      on: {
        SUBMIT: {
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
            assign({
              resource: ({ event }) => event.output,
            }),
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
          actions: assign({ error: ({ event }) => event.error as Error }),
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
          actions: assign({
            resource: ({ event }) => event.output,
          }),
        },
        onError: {
          target: 'SecondFactorIdle',
          actions: assign({ error: ({ event }) => event.error as Error }),
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
            assign({
              resource: ({ event }) => event.output,
            }),
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
          actions: assign({ error: ({ event }) => event.error as Error }),
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
        onDone: {
          actions: assign({ resource: ({ event }) => event.output as SignInResource }),
        },
        onError: {
          actions: assign({ error: ({ event }) => event.error as Error }),
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
      invoke: {
        src: 'authenticateWithRedirect',
        input: ({ context, event }) => {
          assertEvent(event, 'AUTHENTICATE.OAUTH');

          return {
            clerk: context.clerk,
            environment: context.environment,
            strategy: event.strategy,
          };
        },
        onError: {
          actions: assign({ error: ({ event }) => event.error as Error }),
        },
      },
    },
    Complete: {
      entry: 'setAsActive',
      type: 'final',
    },
  },
});
