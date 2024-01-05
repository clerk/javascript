import type { ClerkAPIResponseError } from '@clerk/shared/error';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { EnvironmentResource, OAuthStrategy, SignInResource, Web3Strategy } from '@clerk/types';
import type { ActorRefFrom, MachineContext } from 'xstate';
import { and, assertEvent, assign, enqueueActions, log, not, setup } from 'xstate';

import { ClerkElementsFieldError } from '../errors/error';
import type { ClerkRouter } from '../router';
import type { FormMachine } from './form.machine';
import { waitForClerk } from './shared.actors';
import * as signInActors from './sign-in.actors';
import type { LoadedClerkWithEnv } from './sign-in.types';

export interface SignInMachineContext extends MachineContext {
  clerk: LoadedClerkWithEnv;
  environment?: EnvironmentResource;
  error?: Error | ClerkAPIResponseError;
  loaded: boolean;
  mode: 'browser' | 'server';
  resource: SignInResource | null;
  router: ClerkRouter;
  form: ActorRefFrom<typeof FormMachine>;
}

export interface SignInMachineInput {
  clerk: LoadedClerkWithEnv;
  router: ClerkRouter;
  form: ActorRefFrom<typeof FormMachine>;
}

export type SignInMachineEvents =
  | { type: 'AUTHENTICATE.OAUTH'; strategy: OAuthStrategy }
  | { type: 'AUTHENTICATE.WEB3'; strategy: Web3Strategy }
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
    needsIdentifier: ({ context }) => context.resource?.status === 'needs_identifier',
    needsFirstFactor: ({ context }) => context.resource?.status === 'needs_first_factor',
    needsSecondFactor: ({ context }) => context.resource?.status === 'needs_second_factor',
    needsNewPassword: ({ context }) => context.resource?.status === 'needs_new_password',
    hasSignInResource: ({ context }) => Boolean(context.resource),
    hasClerkAPIError: ({ context }) => isClerkAPIResponseError(context.error),
    hasClerkAPIErrorCode: ({ context }, params?: { code?: string; error?: Error | ClerkAPIResponseError }) => {
      const err = params?.error && context.error;
      return params?.code && err
        ? isClerkAPIResponseError(err)
          ? Boolean(err.errors.find(e => e.code === params.code))
          : false
        : false;
    },
  },
  types: {} as SignInMachineTypes,
}).createMachine({
  id: 'SignIn',
  context: ({ input }) => ({
    clerk: input.clerk,
    environment: input.clerk.__unstable__environment,
    form: input.form,
    loaded: input.clerk.loaded,
    mode: input.clerk.mode,
    resource: null,
    router: input.router,
  }),
  on: {
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
            {
              guard: 'needsNewPassword',
              actions: assign({ error: () => new Error('needs_new_password') }),
              target: '#SignIn.Start', // TOOD: Update target
            },
            {
              guard: 'needsIdentifier',
              actions: assign({ error: () => new Error('needs_identifier') }),
              target: '#SignIn.Start',
            },
            {
              target: '#SignIn.Start',
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
              fields: context.form.getSnapshot().context.fields,
            }),
            onDone: {
              actions: assign({
                resource: ({ event }) => event.output,
              }),
              target: 'Success',
            },
            onError: {
              actions: enqueueActions(({ context, enqueue, event }) => {
                if (isClerkAPIResponseError(event.error)) {
                  // TODO: Move to Event/Action for Re-use
                  const fields: Record<string, ClerkElementsFieldError[]> = {};

                  for (const error of event.error.errors) {
                    const name = error.meta?.paramName;

                    if (!name) {
                      continue;
                    } else if (!fields[name]) {
                      fields[name] = [];
                    }

                    fields[name]?.push(ClerkElementsFieldError.fromAPIError(error));
                  }

                  for (const field in fields) {
                    enqueue.sendTo(context.form, {
                      type: 'FIELD.ERRORS.SET',
                      field: {
                        name: field,
                        errors: fields[field],
                      },
                    });
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
