import type { ClerkAPIResponseError } from '@clerk/shared/error';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import type {
  LoadedClerk,
  OAuthStrategy,
  PrepareFirstFactorParams,
  PrepareSecondFactorParams,
  SamlStrategy,
  SignInFactor,
  SignInFirstFactor,
  SignInResource,
  SignInSecondFactor,
  Web3Strategy,
} from '@clerk/types';
import type { ActorRefFrom, ErrorActorEvent, MachineContext } from 'xstate';
import { and, assertEvent, assign, log, not, or, raise, sendTo, setup } from 'xstate';

import type { ClerkRouter } from '~/react/router';

import { ClerkElementsRuntimeError } from '../errors/error';
import type { FormMachine } from './form.machine';
import { handleRedirectCallback, waitForClerk } from './shared.actors';
import {
  attemptFirstFactor,
  attemptSecondFactor,
  authenticateWithSignInRedirect,
  createSignIn,
  prepareFirstFactor,
  prepareSecondFactor,
} from './sign-in.actors';
import { determineStartingSignInFactor, determineStartingSignInSecondFactor } from './sign-in.utils';
import { assertActorEventDone, assertActorEventError } from './utils/assert';

export interface SignInMachineContext extends MachineContext {
  clerk: LoadedClerk;
  currentFactor: SignInFactor | null;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  resource: SignInResource | null;
  router: ClerkRouter;
}

export interface SignInMachineInput {
  clerk: LoadedClerk;
  form: ActorRefFrom<typeof FormMachine>;
  router: ClerkRouter;
}

export type SignInMachineEvents =
  | ErrorActorEvent
  | { type: 'AUTHENTICATE.OAUTH'; strategy: OAuthStrategy }
  | { type: 'AUTHENTICATE.SAML'; strategy: SamlStrategy }
  | { type: 'AUTHENTICATE.WEB3'; strategy: Web3Strategy }
  | { type: 'FAILURE'; error: Error }
  | { type: 'OAUTH.CALLBACK' }
  | { type: 'SUBMIT' };

export interface SignInMachineTypes {
  context: SignInMachineContext;
  input: SignInMachineInput;
  events: SignInMachineEvents;
}

export const SignInMachine = setup({
  actors: {
    // Root
    waitForClerk,

    // Start
    authenticateWithSignInRedirect,
    createSignIn,

    // First Factor
    prepareFirstFactor,
    attemptFirstFactor,

    // Second Factor
    prepareSecondFactor,
    attemptSecondFactor,

    // SSO
    handleRedirectCallback,
  },
  actions: {
    assignResource: assign(({ event }) => {
      assertActorEventDone<SignInResource>(event);
      return {
        resource: event.output,
      };
    }),
    assignStartingFirstFactor: assign({
      currentFactor: ({ context }) =>
        determineStartingSignInFactor(
          context.clerk.client.signIn.supportedFirstFactors,
          context.clerk.client.signIn.identifier,
          context.clerk.__unstable__environment?.displayConfig.preferredSignInStrategy,
        ),
    }),
    assignStartingSecondFactor: assign({
      currentFactor: ({ context }) =>
        determineStartingSignInSecondFactor(context.clerk.client.signIn.supportedSecondFactors),
    }),
    debug: ({ context, event }, params?: Record<string, unknown>) => console.dir({ context, event, params }),
    logError: ({ event }) => {
      assertActorEventError(event);
      console.error(event.error);
    },
    navigateTo({ context }, { path }: { path: string }) {
      context.router.replace(path);
    },
    raiseFailure: raise(({ event }) => {
      assertActorEventError(event);
      return {
        type: 'FAILURE' as const,
        error: event.error,
      };
    }),
    setAsActive: ({ context }) => {
      const beforeEmit = () => context.router.push(context.clerk.buildAfterSignInUrl());
      void context.clerk.setActive({ session: context.resource?.createdSessionId, beforeEmit });
    },
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
    isCurrentFactorPassword: ({ context }) => context.currentFactor?.strategy === 'password',
    isCurrentFactorTOTP: ({ context }) => context.currentFactor?.strategy === 'totp',
    isCurrentPath: ({ context }, params: { path: string }) => {
      const path = params?.path;
      return path ? context.router.pathname() === path : false;
    },
    isLoggedIn: ({ context }) => Boolean(context.clerk.user),
    isSignInComplete: ({ context }) => context?.resource?.status === 'complete',
    isSingleSessionMode: ({ context }) => Boolean(context.clerk.__unstable__environment?.authConfig.singleSessionMode),
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
  types: {} as SignInMachineTypes,
}).createMachine({
  id: 'SignIn',
  context: ({ input }) => ({
    clerk: input.clerk,
    currentFactor: null,
    formRef: input.form,
    resource: null,
    router: input.router,
  }),
  initial: 'Init',
  on: {
    'CLERKJS.NAVIGATE.*': '.HavingTrouble',
    FAILURE: '.HavingTrouble',
  },
  states: {
    Init: {
      description: 'Ensure that Clerk is loaded and ready',
      initial: 'WaitForClerk',
      onDone: [
        {
          description: 'If sign-in complete or loggedin and single-session, skip to complete',
          guard: or(['isSignInComplete', and(['isLoggedIn', 'isSingleSessionMode'])]),
          target: 'Complete',
        },
        {
          description: 'If the SignIn resource is empty, invoke the sign-in start flow',
          guard: or([not('hasSignInResource'), { type: 'isCurrentPath', params: { path: '/sign-in' } }]),
          target: 'Start',
        },
        {
          description: 'Go to FirstFactor flow state',
          guard: and(['needsFirstFactor', { type: 'isCurrentPath', params: { path: '/sign-in/continue' } }]),
          target: 'FirstFactor',
        },
        {
          description: 'Go to SecondFactor flow state',
          guard: and(['needsSecondFactor', { type: 'isCurrentPath', params: { path: '/sign-in/continue' } }]),
          target: 'SecondFactor',
        },
        {
          description: 'Go to SSO Callback state',
          guard: { type: 'isCurrentPath', params: { path: '/sign-in/sso-callback' } },
          target: 'SSOCallback',
        },
        {
          target: 'Start',
          actions: log('Init: Default to Start'),
        },
      ],
      states: {
        WaitForClerk: {
          invoke: {
            id: 'waitForClerk',
            src: 'waitForClerk',
            input: ({ context }) => context.clerk,
            onDone: 'Success',
            onError: {
              actions: 'raiseFailure',
            },
          },
        },
        Success: {
          type: 'final',
        },
      },
    },
    Start: {
      id: 'Start',
      description: 'The intial state of the sign-in flow.',
      initial: 'AwaitingInput',
      on: {
        'AUTHENTICATE.OAUTH': '#SignIn.AuthenticatingWithRedirect',
        'AUTHENTICATE.SAML': '#SignIn.AuthenticatingWithRedirect',
      },
      onDone: [
        {
          guard: 'isSignInComplete',
          target: 'Complete',
        },
        {
          guard: 'needsFirstFactor',
          target: 'FirstFactor',
        },
        {
          guard: 'needsSecondFactor',
          target: 'SecondFactor',
        },
      ],
      states: {
        AwaitingInput: {
          description: 'Waiting for user input',
          on: {
            SUBMIT: {
              target: 'Attempting',
              reenter: true,
            },
          },
        },
        Attempting: {
          invoke: {
            id: 'createSignIn',
            src: 'createSignIn',
            input: ({ context }) => ({
              client: context.clerk.client,
              fields: context.formRef.getSnapshot().context.fields,
            }),
            onDone: {
              actions: 'assignResource',
              target: 'Success',
            },
            onError: {
              actions: 'setFormErrors',
              target: 'AwaitingInput',
            },
          },
        },
        Success: {
          type: 'final',
        },
      },
    },
    FirstFactor: {
      initial: 'DeterminingState',
      entry: 'assignStartingFirstFactor',
      onDone: [
        {
          guard: 'isSignInComplete',
          target: 'Complete',
        },
        {
          guard: 'needsSecondFactor',
          target: 'SecondFactor',
        },
      ],
      states: {
        DeterminingState: {
          always: [
            {
              description: 'If the current factor is not password, prepare the factor',
              guard: not('isCurrentFactorPassword'),
              target: 'Preparing',
            },
            {
              description: 'Else, skip to awaiting input',
              target: 'AwaitingInput',
            },
          ],
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

              return {
                client: context.clerk.client,
                params: !context.currentFactor ? null : (context.currentFactor as PrepareFirstFactorParams),
              };
            },
            onDone: {
              actions: 'assignResource',
              target: 'AwaitingInput',
            },
            onError: {
              actions: 'setFormErrors',
              target: 'AwaitingInput',
            },
          },
        },
        AwaitingInput: {
          description: 'Waiting for user input',
          on: {
            SUBMIT: {
              target: 'Attempting',
              reenter: true,
            },
          },
        },
        Attempting: {
          invoke: {
            id: 'attemptFirstFactor',
            src: 'attemptFirstFactor',
            input: ({ context }) => ({
              client: context.clerk.client,
              params: {
                currentFactor: context.currentFactor as SignInFirstFactor,
                fields: context.formRef.getSnapshot().context.fields,
              },
            }),
            onDone: {
              actions: 'assignResource',
              target: 'Success',
            },
            onError: {
              actions: 'setFormErrors',
              target: 'AwaitingInput',
            },
          },
        },
        Success: {
          type: 'final',
        },
      },
    },
    SecondFactor: {
      initial: 'DeterminingState',
      entry: 'assignStartingSecondFactor',
      onDone: [
        {
          guard: 'isSignInComplete',
          target: 'Complete',
        },
      ],
      states: {
        DeterminingState: {
          always: [
            {
              description: 'If the current factor is not TOTP, prepare the factor',
              guard: not('isCurrentFactorTOTP'),
              target: 'Preparing',
              reenter: true,
            },
            {
              description: 'Else, skip to awaiting input',
              target: 'AwaitingInput',
              reenter: true,
            },
          ],
        },
        Preparing: {
          invoke: {
            id: 'prepareSecondFactor',
            src: 'prepareSecondFactor',
            input: ({ context }) => ({
              client: context.clerk.client,
              params: !context.currentFactor ? null : (context.currentFactor as PrepareSecondFactorParams),
            }),
            onDone: {
              actions: 'assignResource',
              target: 'AwaitingInput',
            },
            onError: {
              actions: 'setFormErrors',
              target: 'AwaitingInput',
            },
          },
        },
        AwaitingInput: {
          description: 'Waiting for user input',
          on: {
            SUBMIT: {
              target: 'Attempting',
              reenter: true,
            },
          },
        },
        Attempting: {
          invoke: {
            id: 'attemptSecondFactor',
            src: 'attemptSecondFactor',
            input: ({ context }) => ({
              client: context.clerk.client,
              params: {
                currentFactor: context.currentFactor as SignInSecondFactor,
                fields: context.formRef.getSnapshot().context.fields,
              },
            }),
            onDone: {
              actions: [
                assign({
                  resource: ({ event }) => event.output,
                }),
              ],
              target: 'Success',
            },
            onError: {
              actions: 'setFormErrors',
              target: 'AwaitingInput',
            },
          },
        },
        Success: {
          type: 'final',
        },
      },
    },
    AuthenticatingWithRedirect: {
      invoke: {
        id: 'authenticateWithSignInRedirect',
        src: 'authenticateWithSignInRedirect',
        input: ({ context, event }) => {
          assertEvent(event, ['AUTHENTICATE.OAUTH', 'AUTHENTICATE.SAML']);

          if (event.type === 'AUTHENTICATE.SAML' && event.strategy === 'saml') {
            return {
              clerk: context.clerk,
              params: {
                strategy: event.strategy,
                emailAddress: '', // TODO: Handle case
                identifier: '', // TODO: Handle case
                // continueSignUp
              },
            };
          }

          return {
            clerk: context.clerk,
            params: {
              strategy: event.strategy,
              // continueSignUp
            },
          };
        },
        onError: {
          actions: 'setFormErrors',
        },
      },
    },
    SSOCallback: {
      tags: 'external',
      initial: 'Attempting',
      on: {
        'CLERKJS.NAVIGATE.COMPLETE': '#SignIn.Complete',
        'CLERKJS.NAVIGATE.RESET_PASSWORD': '#SignIn.NotImplemented',
        'CLERKJS.NAVIGATE.SIGN_IN': {
          actions: [
            log('Navigating to sign in'),
            {
              type: 'navigateTo',
              params: {
                path: '/sign-in',
              },
            },
          ],
        },
        'CLERKJS.NAVIGATE.SIGN_UP': {
          actions: [
            log('Navigating to sign in'),
            {
              type: 'navigateTo',
              params: {
                path: '/sign-up',
              },
            },
          ],
        },
        'CLERKJS.NAVIGATE.VERIFICATION': {
          actions: [
            log('Navigating to sign in'),
            {
              type: 'navigateTo',
              params: {
                path: '/sign-up',
              },
            },
          ],
        },
        'CLERKJS.NAVIGATE.CONTINUE': {
          description: 'Redirect to the sign-up flow',
          actions: [
            log('Navigating to sign up'),
            {
              type: 'navigateTo',
              params: {
                path: '/sign-up',
              },
            },
          ],
        },
        'CLERKJS.NAVIGATE.*': {
          target: '#SignIn.Start',
          actions: [
            {
              type: 'setGlobalError',
              params: {
                error: new ClerkElementsRuntimeError('Unknown navigation event.'),
              },
            },
          ],
        },
      },
      states: {
        Attempting: {
          invoke: {
            id: 'handleRedirectCallback',
            src: 'handleRedirectCallback',
            input: ({ context }) => context.clerk,
            onError: {
              actions: 'setFormErrors',
            },
          },
        },
      },
    },
    HavingTrouble: {
      id: 'HavingTrouble',
      always: 'Start',
    },
    NotImplemented: {
      entry: log('Not implemented.'),
    },
    Complete: {
      id: 'Complete',
      type: 'final',
      entry: 'setAsActive',
    },
  },
});
