import type { ClerkAPIResponseError } from '@clerk/shared/error';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import type {
  EnvironmentResource,
  PrepareFirstFactorParams,
  SignInFactor,
  SignInFirstFactor,
  SignInResource,
} from '@clerk/types';
import type { MachineContext } from 'xstate';
import { assign, enqueueActions, not, raise, setup } from 'xstate';

import { ClerkElementsFieldError } from '../errors/error';
import { attemptFirstFactor, determineStartingFirstFactor, prepareFirstFactor } from './sign-in.actors';
import type { LoadedClerkWithEnv } from './sign-in.types';

export interface SignInFirstFactorMachineContext extends MachineContext {
  clerk: LoadedClerkWithEnv;
  currentFactor: SignInFactor | null;
  environment?: EnvironmentResource;
  error?: Error | ClerkAPIResponseError;
  resource: SignInResource | null;
}

export interface SignInFirstFactorMachineInput {
  clerk: LoadedClerkWithEnv;
  environment?: EnvironmentResource;
}

export type SignInFirstFactorMachineEvents = {
  type: 'SUBMIT';
  strategy?: 'password' | 'email_code' | 'phone_code' | 'email_link';
};

export type SignInFirstFactorTags = 'initializing' | 'awaiting-input' | 'loading';
export interface SignInFirstFactorMachineTypes {
  context: SignInFirstFactorMachineContext;
  input: SignInFirstFactorMachineInput;
  events: SignInFirstFactorMachineEvents;
  tags: SignInFirstFactorTags;
}

export const SignInFirstFactorMachine = setup({
  actors: {
    determineStartingFactor: determineStartingFirstFactor,
    attemptFirstFactor,
    prepareFirstFactor,
  },
  actions: {
    debug: ({ context, event }, params?: Record<string, unknown>) => console.dir({ context, event, params }),
    ensureSynchronizedRouterPath({ context }, { requiredPath }: { requiredPath: string }) {
      if (context.router.pathname() !== requiredPath) {
        context.router.replace(requiredPath);
      }
    },
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
    hasCurrentFactor: ({ context }) => Boolean(context.currentFactor),
    isServer: ({ context }) => context.mode === 'server',
    isBrowser: ({ context }) => context.mode === 'browser',
    isCurrentFactorPassword: ({ context }) => context.currentFactor?.strategy === 'password',
    isClerkLoaded: ({ context }) => context.clerk.loaded,
    isClerkEnvironmentLoaded: ({ context }) => Boolean(context.clerk.__unstable__environment),
    isSignInComplete: ({ context }) => context?.resource?.status === 'complete',
    isLoggedIn: ({ context }) => Boolean(context.clerk.user),
    isSingleSessionMode: ({ context }) => Boolean(context.clerk.__unstable__environment?.authConfig.singleSessionMode),
    isRedirectCallback: ({ context }) => context.router.pathname() === '/sso-callback',
    needsIdentifier: ({ context }) =>
      context.clerk.client.signIn.status === 'needs_identifier' || context.resource?.status === 'needs_identifier',
    needsFirstFactor: ({ context }) =>
      context.clerk.client.signIn.status === 'needs_first_factor' || context.resource?.status === 'needs_first_factor',
    needsSecondFactor: ({ context }) =>
      context.clerk.client.signIn.status === 'needs_second_factor' ||
      context.resource?.status === 'needs_second_factor',
    needsNewPassword: ({ context }) =>
      context.clerk.client.signIn.status === 'needs_new_password' || context.resource?.status === 'needs_new_password',
    hasSignInResource: ({ context }) => Boolean(context.clerk.client.signIn || context.resource),
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
  types: {} as SignInFirstFactorMachineTypes,
}).createMachine({
  id: 'SignInFirstFactor',
  context: ({ input }) => ({
    clerk: input.clerk,
    currentFactor: null,
    environment: input.environment,
    resource: null,
  }),
  initial: 'DeterminingState',
  // output: {

  // },
  states: {
    DeterminingState: {
      always: [
        {
          guard: not('hasCurrentFactor'),
          target: 'DetermineStartingFactor',
          reenter: true,
        },
        {
          guard: not('isCurrentFactorPassword'),
          target: 'Preparing',
          reenter: true,
        },
        {
          target: 'AwaitingInput',
          reenter: true,
        },
      ],
    },
    DetermineStartingFactor: {
      invoke: {
        id: 'determineStartingFirstFactor',
        src: 'determineStartingFactor',
        input: ({ context }) => ({
          supportedFactors: context.clerk.client.signIn.supportedFirstFactors,
          identifier: context.clerk.client.signIn.identifier,
          preferredStrategy: context.environment?.displayConfig.preferredSignInStrategy,
        }),
        onDone: {
          actions: assign({ currentFactor: ({ event }) => event.output }),
          target: 'DeterminingState',
          reenter: true,
        },
        onError: {
          target: 'Failure',
          actions: assign({ error: ({ event }) => event.error as Error }),
        },
      },
    },
    Preparing: {
      invoke: {
        id: 'prepareFirstFactor',
        src: 'prepareFirstFactor',
        input: ({ context }) => {
          // TODO: Handle the following strategies:
          // - email_link (redirectUrl)
          // - saml (redirectUrl, actionCompleteRedirectUrl)
          // - oauth (redirectUrl, actionCompleteRedirectUrl)

          // context.router.searchParams

          return {
            client: context.clerk.client,
            params: !context.currentFactor ? null : (context.currentFactor as PrepareFirstFactorParams),
          };
        },
        onDone: {
          target: 'AwaitingInput',
          actions: [
            assign({
              resource: ({ event }) => event.output,
            }),
          ],
        },
        onError: {
          target: 'Failure',
          actions: assign({ error: ({ event }) => event.error as Error }),
        },
      },
    },
    AwaitingInput: {
      description: 'Waiting for user input',
      on: {
        SUBMIT: 'Attempting',
      },
    },
    Attempting: {
      invoke: {
        id: 'attemptFirstFactor',
        src: 'attemptFirstFactor',
        input: ({ context }) => ({
          client: context.clerk.client,
          params: {
            fields: context.fields,
            currentFactor: context.currentFactor as SignInFirstFactor,
          },
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
                enqueue(
                  raise({
                    type: 'FIELD.ERRORS.SET',
                    field: {
                      type: field,
                      errors: fields[field],
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
      type: 'final',
    },
    Failure: {
      type: 'final',
    },
  },
});
