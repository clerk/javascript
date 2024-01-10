import type { ClerkAPIResponseError } from '@clerk/shared/error';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import type {
  LoadedClerk,
  OAuthStrategy,
  PrepareFirstFactorParams,
  PrepareSecondFactorParams,
  SignInFactor,
  SignInFirstFactor,
  SignInResource,
  SignInSecondFactor,
  Web3Strategy,
} from '@clerk/types';
import type { ActorRefFrom, ErrorActorEvent, MachineContext } from 'xstate';
import { and, assertEvent, assign, log, not, or, raise, sendTo, setup } from 'xstate';

import type { ClerkRouter } from '~/react/router';

import type { FormMachine } from './form.machine';
import { waitForClerk } from './shared.actors';
import {
  attemptFirstFactor,
  attemptSecondFactor,
  authenticateWithRedirect,
  createSignIn,
  handleSSOCallback,
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
  mode: 'browser' | 'server';
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
    authenticateWithRedirect,
    createSignIn,

    // First Factor
    prepareFirstFactor,
    attemptFirstFactor,

    // Second Factor
    prepareSecondFactor,
    attemptSecondFactor,

    // SSO
    handleSSOCallback,
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
          context.clerk.__unstable__environment.displayConfig.preferredSignInStrategy,
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
  /** @xstate-layout N4IgpgJg5mDOIC5QGUCWUB2BJDBiAYgIJYAyAqgEoCiA2gAwC6ioADgPayoAuqbGzIAB6IALACYANCACeiABwBGAHQBORWICsAdg0KRKjSLkBmAL6mpaTDiU5uuCHzBLYXAIZdnV7BlsZu9ExIIOycPHwCwggakjKIYgBsxmJKGipaxgmKaskJIuaW6D5+9o4Yzq4eXkU2dlw0CkGsHNy8-MFRWklKcirGavqKCVpaKlKyCEZySgkqdAl0mioKxhkaBSDetf5cDk4u7p5KW751NGJNIS3h7aBRCbETmhoaSmJaYgpyGcbG2mYWTY1U47PblA5VY7Akr1YyXUKtCIdRAKMSPFGfERvPpaRRyDSKBR0fKAk4wsEVQ7VawggIieHXNqRRBaETGHp9AZqBTDUbjRDJOhKX5srpzERJIkAwo08llSmQslnDQMsJM5EIVns3r9OSDHkjMZxBD9LQzNKZBQaPIJFbrUnQupKADqbm4+DYACcAMIAGzAnoA1hSlKgMAA3NiB5wAdzdXA9Pv9QcCAgRN2ZJq6PTZcgW4ltYhUCX50V+SjWYiMK3mUo2Sp2Lvjib9AeDAc9XqULF9HgAZl6ALZKOPur2tlOMNOMpF3FGrYViRT6hS4kQE0siVHCuh0OR6lbF3cJevQ5DuT27eUQo5k89uS+p4Lp9Vz6Lok2fIVVj4DEy2lRT1le9LxDSpbzPC96kaac1VnIQUQUAxhW+DIeTkT5Vw-L5vlUVFZjzFRi3XIDihAq99nA6kyKg85VURW4EIQBQkNeYxUOMdDMI+UtVwlVJrT+LQWN3F45FImxyNwQgyAAFQACSoAA5WSsG9QhZKoJQAHkZIUp9mjgxiolROg2I4riWJ440q13VItDoK06F+BziRPB1gKgpRCFHHgMCgHAWAAV12ZAyAAIQAWSwWSDKuIzM2MEQzWPYxHIwh4VjyUsxF3ZRFk+ExejRKtpSBTyHy4byuE8QcWD8qAQzDSNoyUABjT0wCqE44pfeCogw6Z0l0DQ9yMPo2V4lRNFUZJDAebQ0VxCTfHI6ravqsNGo7Lse37Id2s67rgV6mdjIFZKlFS9LEk+TIRCmugVFUOZvhiPc8mElalHwVBPVcfA3DargvTAqkoVlX7-oTIGQc9U6Eo1JcXhmTQiR0dI6C6LQcsc5R2LEkRnNZNR3JlYooYB2HQevKiIYpv6qeBr0GnojMkfxV4FvRtIHOx3iuixNl0mS-okhUEiPIZ6HAeZz0lAAETATxPUHMMtvvTxcARhjMx5DR2X0Nk0TmYSYmMXH8Su3E0tyh41HEqWbEpmG5cV5WAzV-x-M1sBtZg58zr1hIDaUI3kiLLGrTEC3jSQom3lmeYCr1ZHvpd2W4aUAAFTqWAfLamojKNnBYPOHzADPqfhqdA8Rt8q1XGZ2JYlYWIeYlcYyGZXs0cRVhc9PGddrPc7AfPPULnb5b2rgB1V7ty86qu5Z19mG63M0kkJNueVyh6bJ5LEPjurcsc4hQh5l6vvN8rbApC3AwqimK19fJjNE+K6Hi6LG5GThQAtxAVmLMWTIxIqwiBJOTZ2w9M5dkIDVMAdUGpFxas4DwG0ExwOrm-fq8RN7Nx3hfDuB8Jj62UF0bQcwY5skWFfJmWdEFYKnp6TsM9exzwOpg5B9UV5wzwedBAjct4txYiQ-eAtljmgMAaImVphjfWQGANqfAIDwM9GDRUZ4VFqI0YIzMABaNu7Jhj-wNslBIsxxCllyOyQwihnJEglP0Mqd5dEYHUTfJWKsvYaypNrWuhldYamSBLJQTkT5fCenuXiDwEipHicJIm1oXhiCUR4rxbsfGe3Vj7AJrNYIhLfGErEkS0TRNerxCU0x8SOXEMSZKjl0lO1WpkjROcl6F2vM1Eui9x4V2Uaozx+ignxWKUxImHw3hQMyLiYYuh3hxMWG8YS6QrSHgwoBVpxx2k3zHhPVh7DuycPnsOMuAzOpDL0bgsZfUhFTJSJAuZeYdCohxnHWY7I0rJH-khHQZNypkT2W7Hy8Z74YGCqFCK0VYp3KDhqLc4T8T4T3AMW0vF3j41xESUBUC+gZOGVkphSCUHdP2L01qPCUHXJGbctm78oiPJmWyMxCz3m8WicKCUfQkhVheHuQlNzQWks2v5XA08Tn7QXtS+qtLiUs3hfXSZWMnmzLZW8pZcdBQzPmA8EwxIzLQKBZJZA2lvRuF9L6AARkDQMFAgoYG9o1HpxdWp3jNRaq1tq2r2sdc6hAvS2oeDaIEAxGprTKGGljZKGR9W8QJEKdKepdx4paTA1anrLU2rtQ6p1RzdqnIOh6812afV+vzf5QNxdg03DDUqiZURrQpDyPMHUT1I2ALjlMVQb1OJbl+HkbZGbjhZu9bm-1hdw1vgWCkKOcwrKsjMbxU0qhBKJrZOIKsSix05t9Xm51-sGX4JNL0CJn8nqrAJBkVkAsVlITFsMcQEoPjfTqKgEN-ldIhQABaEF-WADAPBa1tAlWwwt0rhwNlaJ+qA36uB-oA0B1AIG+DVsjKhjA9bj1CL0NmNcWQcI6D3B8p4RZXg6CSuIUYe59yArJPJNw4YtqyU7EFa1-pAk4cSjHK6VZix5k4riDtpYTBhzmPEtQHw9BsnMICDAbAIBwAECcIp68mLGMtDMYTFiujWI-IYhJu5jNbjyL0PIBs307DU4y+IRonijFUFA7ee9P5aCs9wJsY4kxthsyekYpZRrTF+J8NGVjwHJQ81VZAQU2ptTgPAOujbEDNuFPEuZswkKaEC2lbT7xxB0aIstHZ5E-O4aQgLEYzceXDD7skS+JWvJgtaP5B+XAyvB1Iyiaayh1xQJjg8ft6aTWrSa6KhqHWI25ZeEkMyV7iQaCmrx1EnFvjrmSFqJRXkYtxYS5Nt8RIVg9EEiYGrQmprrjDtvAeRJehEQYSPL0+2mJ6F4yMGI+ZixvK7eQ3QCTlgbtxNof+7mdn8K7Dk1WeSoC+2eyZZKlCdCJGJF93QP3utpB6CHQTqw9QvAex0g5Bd-Jw-iM5FIhF2KSdGmQsnVsFEzdcr8AnN9msNTa6T4RIchS2n3GZEYH1Y7kL6KY95SUvjFiJPR6E4P5bMN4RNpL6moi5XeFjvoeZEgGE7p84SMwiPOQlETNELO3Y7fi7ARLwTlfxG5-rvn2gHKCbiXros1i+jaC+EKulctOdpTyGHTiId0gOVGl15iC3xNZDREkYSIw3E6KJR0yHfj8lVD9yxFIbJ9Yh7Mljap+4w41asQ+vM0vgIgtHl0knSvbMmisQkrXaU9C-J5Mss0W5Ei4u+FaV9JXK8ILvq1yFIVOfGyFvMNcfRURFmqQ8CJGv-7vDULzb3Cq5fja2n7kvic+j1NbyWOOrEw7NpGIdtEaQ18dPN3t2vJ7x9h0n3qafJtOVER6Di3mmIzLl7Iru8tB6W+d+uGqwLuRmo0eg3w5irEUWH6DU8GiGCGgGwGIa8E9yesUCiOH2KO7K6Owi-QlCeobyyUzmv+NgjGzG-krGbA7G-onOR8ES8wiQHw-Q+gWQomygCyqaGU6gPI303obAdU-ong9ByEzShgeg4WSUEsOUIsPc7Kc0liAI5gQAA */
  id: 'SignIn',
  context: ({ input }) => ({
    clerk: input.clerk,
    currentFactor: null,
    formRef: input.form,
    mode: input.clerk.mode,
    resource: null,
    router: input.router,
  }),
  initial: 'Init',
  on: {
    FAILURE: {
      target: '.HavingTrouble',
    },
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
          description: 'Default to the initial sign-in flow state',
          guard: and(['needsFirstFactor', { type: 'isCurrentPath', params: { path: '/sign-in/continue' } }]),
          target: 'FirstFactor',
        },
        {
          description: 'Default to the initial sign-in flow state',
          guard: and(['needsSecondFactor', { type: 'isCurrentPath', params: { path: '/sign-in/continue' } }]),
          target: 'SecondFactor',
        },
        {
          description: 'Default to the initial sign-in flow state',
          guard: and(['needsSecondFactor', { type: 'isCurrentPath', params: { path: '/sign-in/sso-callback' } }]),
          target: 'SSOCallbackRunning',
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
        'AUTHENTICATE.OAUTH': '#SignIn.InitiatingOAuthAuthentication',
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
          actions: [assign({ resource: ({ event }) => event.output as SignInResource })],
        },
        onError: {
          actions: 'setFormErrors',
        },
      },
      always: [
        {
          guard: 'isSignInComplete',
          actions: 'setAsActive',
        },
        {
          guard: 'needsFirstFactor',
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
            environment: context.clerk.__unstable__environment,
            strategy: event.strategy,
          };
        },
        onError: {
          actions: 'setFormErrors',
        },
      },
    },
    HavingTrouble: {
      id: 'HavingTrouble',
      always: 'Start',
      // type: 'final',
    },
    Complete: {
      id: 'Complete',
      type: 'final',
      entry: 'setAsActive',
    },
  },
});
