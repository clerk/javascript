import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type {
  Attribute,
  LoadedClerk,
  OAuthStrategy,
  SamlStrategy,
  SignInResource,
  SignUpField,
  SignUpResource,
  SignUpVerifiableField,
  SignUpVerificationsResource,
  VerificationStatus,
  VerificationStrategy,
  Web3Strategy,
} from '@clerk/types';
import type { ActorRefFrom, ErrorActorEvent, MachineContext } from 'xstate';
import { and, assertEvent, assign, log, raise, sendTo, setup } from 'xstate';

import type { ClerkElementsErrorBase } from '~/internals/errors/error';
import { ClerkElementsRuntimeError } from '~/internals/errors/error';
import type { FormMachine } from '~/internals/machines/form/form.machine';
import { handleRedirectCallback, waitForClerk } from '~/internals/machines/shared.actors';
import {
  authenticateWithSignUpRedirect,
  createSignUp,
  prepareEmailAddressVerification,
  preparePhoneNumberVerification,
  prepareWeb3WalletVerification,
  startSignUpEmailLinkFlow,
} from '~/internals/machines/sign-up/sign-up.actors';
import { assertActorEventDone, assertActorEventError } from '~/internals/machines/utils/assert';
import type { ClerkJSNavigationEvent } from '~/internals/machines/utils/clerkjs';
import type { ClerkRouter } from '~/react/router';
import { type EnabledThirdPartyProviders, getEnabledThirdPartyProviders } from '~/utils/third-party-strategies';

type SignUpVerificationsResourceKey = keyof SignUpVerificationsResource;

export interface SignUpMachineContext extends MachineContext {
  clerk: LoadedClerk;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  resource: SignUpResource | null;
  resourceVerification: SignUpVerificationsResource | null;
  router: ClerkRouter;
  thirdPartyProviders: EnabledThirdPartyProviders;
}

export interface SignUpMachineInput {
  clerk: LoadedClerk;
  form: ActorRefFrom<typeof FormMachine>;
  router: ClerkRouter;
}

export type SignUpMachineEvents =
  | ErrorActorEvent
  | { type: 'AUTHENTICATE.OAUTH'; strategy: OAuthStrategy }
  | { type: 'AUTHENTICATE.SAML'; strategy: SamlStrategy }
  | { type: 'AUTHENTICATE.WEB3'; strategy: Web3Strategy }
  | { type: 'FAILURE'; error: Error }
  | { type: 'OAUTH.CALLBACK' }
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS' }
  | { type: 'EMAIL_LINK.VERIFIED'; resource: SignUpResource }
  | { type: 'EMAIL_LINK.EXPIRED'; resource: SignUpResource }
  | { type: 'EMAIL_LINK.RESTART' }
  | { type: 'EMAIL_LINK.FAILURE'; error: Error }
  | { type: ClerkJSNavigationEvent };

export type SignUpVerificationTags = 'code' | VerificationStrategy;

export type SignUpStateTags = 'state:start' | 'state:continue' | 'state:verification';

export type SignUpTags = SignUpStateTags | SignUpVerificationTags | 'external';
export type SignUpDelays = 'TIMEOUT.POLLING';

export interface SignUpMachineTypes {
  context: SignUpMachineContext;
  input: SignUpMachineInput;
  events: SignUpMachineEvents;
  tags: SignUpTags;
  delays: SignUpDelays;
}

export const SignUpMachine = setup({
  actors: {
    // Root
    waitForClerk,

    // Start
    createSignUp,

    // Verification
    preparePhoneNumberVerification,
    prepareEmailAddressVerification,
    prepareWeb3WalletVerification,

    startSignUpEmailLinkFlow,

    // OAuth & Web3
    authenticateWithSignUpRedirect,

    // Callbacks
    handleRedirectCallback,
  },
  actions: {
    assignResource: assign(({ event }) => {
      assertActorEventDone<SignInResource>(event);
      return {
        resource: event.output,
      };
    }),
    assignThirdPartyProviders: assign({
      thirdPartyProviders: ({ context }) => getEnabledThirdPartyProviders(context.clerk.__unstable__environment),
    }),
    raiseFailure: raise(({ event }) => {
      assertActorEventError(event);
      return {
        type: 'FAILURE' as const,
        error: event.error,
      };
    }),
    setAsActive: ({ context }) => {
      const beforeEmit = () => context.router.push(context.clerk.buildAfterSignUpUrl());
      void context.clerk.setActive({ session: context.resource?.createdSessionId, beforeEmit });
    },
    // Necessary?
    setGlobalError: ({ context }, { error }: { error: ClerkElementsErrorBase }) =>
      sendTo(context.formRef, {
        type: 'ERRORS.SET',
        error,
      }),
    navigateTo({ context }, { path }: { path: string }) {
      context.router.replace(path);
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
    areFieldsMissing: ({ context }) => (context.resource ? context.resource.missingFields.length > 0 : false),
    areFieldsUnverified: ({ context }) => (context.resource ? context.resource.unverifiedFields.length > 0 : false),
    currentPathMatches: ({ context }, { regex }: { regex: RegExp }) =>
      regex ? Boolean(context.router.pathname()?.match(regex)) : false,
    isFieldMissing: ({ context }, { field }: { field: SignUpField }) =>
      context.resource ? context.resource.missingFields.includes(field) : false,
    isFieldUnverified: ({ context }, { field }: { field: SignUpVerifiableField }) =>
      context.resource ? context.resource.unverifiedFields.includes(field) : false,
    isStrategyEnabled: (
      { context },
      { attribute, strategy }: { attribute: Attribute; strategy: VerificationStrategy },
    ) =>
      Boolean(
        context.clerk.__unstable__environment?.userSettings.attributes[attribute].verifications.includes(strategy),
      ),
    shouldAvoidPrepare: ({ context }, { key }: { key: SignUpVerificationsResourceKey }) =>
      !context.resource?.status || context.resource.verifications[key].status === 'verified',
    isStatusAbandoned: ({ context }) => context.resource?.status === 'abandoned',
    isStatusComplete: ({ context }) => context?.resource?.status === 'complete',
    isStatusMissingRequirements: ({ context }) => context.resource?.status === 'missing_requirements',
    isVerificationStatusExpired: (
      { context },
      params: { strategy: SignUpVerificationsResourceKey; status: VerificationStatus },
    ) => context.clerk.client.signUp.verifications[params.strategy].status === 'expired',

    shouldValidatePhoneCode: and([
      {
        type: 'isFieldUnverified',
        params: {
          field: 'phone_number' as const,
        },
      },
    ]),

    shouldValidateEmailLink: and([
      {
        type: 'isFieldUnverified',
        params: {
          field: 'email_address' as const,
        },
      },
      {
        type: 'isStrategyEnabled',
        params: {
          attribute: 'email_address' as const,
          strategy: 'email_link' as const,
        },
      },
    ]),
    shouldValidateEmailCode: and([
      {
        type: 'isFieldUnverified',
        params: {
          field: 'email_address' as const,
        },
      },
      {
        type: 'isStrategyEnabled',
        params: {
          attribute: 'email_address' as const,
          strategy: 'email_code' as const,
        },
      },
    ]),
  },
  delays: {
    'TIMEOUT.POLLING': 300_000, // 5 minutes
  },
  types: {} as SignUpMachineTypes,
}).createMachine({
  id: 'SignUp',
  context: ({ input }) => ({
    clerk: input.clerk,
    formRef: input.form,
    resource: null,
    resourceVerification: null,
    router: input.router,
    thirdPartyProviders: getEnabledThirdPartyProviders(input.clerk.__unstable__environment),
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
      onDone: [
        {
          description: 'Taken when an SSO Callback is required',
          target: 'SSOCallback',
          guard: {
            type: 'currentPathMatches',
            params: {
              regex: /\/sso-callback$/,
            },
          },
        },
        {
          description: 'By default, we enter the Start state',
          target: 'Start',
        },
      ],
    },
    AuthenticatingWithRedirect: {
      invoke: {
        id: 'authenticateWithSignUpRedirect',
        src: 'authenticateWithSignUpRedirect',
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
          } else if (event.type === 'AUTHENTICATE.OAUTH' && event.strategy) {
            return {
              clerk: context.clerk,
              params: {
                strategy: event.strategy,
                // continueSignUp
              },
            };
          }

          throw new ClerkElementsRuntimeError('Invalid strategy');
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
        'CLERKJS.NAVIGATE.COMPLETE': '#SignUp.Complete',
        'CLERKJS.NAVIGATE.CONTINUE': '#SignUp.Continue',
        'CLERKJS.NAVIGATE.RESET_PASSWORD': '#SignUp.NotImplemented',
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
        'CLERKJS.NAVIGATE.SIGN_UP': '#SignUp.Start',
        'CLERKJS.NAVIGATE.VERIFICATION': '#SignUp.Verification',
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
    Start: {
      id: 'Start',
      tags: 'state:start',
      description: 'The intial state of the sign-in flow.',
      entry: 'assignThirdPartyProviders',
      initial: 'AwaitingInput',
      on: {
        'AUTHENTICATE.OAUTH': '#SignUp.AuthenticatingWithRedirect',
        'AUTHENTICATE.SAML': '#SignUp.AuthenticatingWithRedirect',
      },
      onDone: [
        {
          guard: and(['isStatusMissingRequirements', 'areFieldsUnverified']),
          target: 'Verification',
        },
        {
          guard: 'areFieldsMissing',
          target: 'Continue',
        },
        {
          guard: 'isStatusComplete',
          actions: 'setAsActive',
          target: 'Complete',
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
            id: 'createSignUp',
            src: 'createSignUp',
            input: ({ context }) => ({
              clerk: context.clerk,
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
    Continue: {
      tags: 'state:continue',
      entry: log('#SignUp.Continue: Not implemented.'),
    },
    Verification: {
      tags: 'state:verification',
      description: 'Verification state of the sign-up flow',
      initial: 'Init',
      states: {
        Init: {
          description: 'Determine what verification strategy to use.',
          always: [
            {
              description: 'Validate via phone number',
              guard: {
                type: 'isFieldUnverified',
                params: {
                  field: 'phone_number' as const,
                },
              },
              target: 'PhoneCode',
            },
            {
              description: 'Validate via email link',
              guard: 'shouldValidateEmailLink',
              target: 'EmailLink',
            },
            {
              description: 'Validate via email code',
              guard: 'shouldValidateEmailCode',
              target: 'EmailCode',
            },
            {
              actions: log('No verification strategy found'),
            },
          ],
        },
        EmailLink: {
          initial: 'Init',
          states: {
            Init: {
              always: [
                {
                  guard: {
                    type: 'shouldAvoidPrepare',
                    params: {
                      key: 'emailAddress' as const,
                    },
                  },
                  target: 'Attempting',
                },
                {
                  target: 'Preparing',
                },
              ],
            },
            Preparing: {
              invoke: {
                id: 'prepareEmailAddressLinkVerification',
                src: 'prepareEmailAddressVerification',
                input: ({ context }) => ({
                  clerk: context.clerk,
                  params: {
                    strategy: 'email_link',
                    redirectUrl: context.clerk.buildAfterSignUpUrl(),
                  },
                }),
                onDone: {
                  actions: 'assignResource',
                  target: 'Attempting',
                },
              },
            },
            Attempting: {
              on: {
                'EMAIL_LINK.VERIFIED': {
                  // event.output.verifications.emailAddress.verifiedFromTheSameClient (TODO: MODAL?)
                  target: 'Success',
                },
                'EMAIL_LINK.EXPIRED': {
                  target: 'Expired',
                },
                'EMAIL_LINK.RESTART': {
                  actions: sendTo('signUpEmailLinkFlow', { type: 'STOP' }),
                  target: 'Attempting',
                  reenter: true,
                },
                'EMAIL_LINK.FAILURE': {
                  actions: raise(({ event }) => ({ type: 'FAILURE', error: event.error })),
                },
              },
              invoke: {
                id: 'signUpEmailLinkFlow',
                src: 'startSignUpEmailLinkFlow',
                input: ({ context }) => ({
                  clerk: context.clerk,
                }),
              },
              after: {
                'TIMEOUT.POLLING': {
                  description: 'Timeout after 5 minutes',
                  actions: [
                    sendTo('signUpEmailLinkFlow', { type: 'STOP' }),
                    sendTo(({ context }) => context.formRef, {
                      type: 'ERRORS.SET',
                      error: new ClerkElementsRuntimeError('Email link verification timed out.'),
                    }),
                  ],
                  target: 'Expired',
                },
              },
            },
            Success: {
              type: 'final',
            },
            Expired: {
              entry: log('Expired'),
            },
          },
          onDone: 'Success',
        },
        EmailCode: {
          initial: 'Init',
          states: {
            Init: {
              always: [
                {
                  guard: {
                    type: 'shouldAvoidPrepare',
                    params: {
                      key: 'emailAddress' as const,
                    },
                  },
                  target: 'AwaitingInput',
                },
                {
                  target: 'Preparing',
                },
              ],
            },
            Preparing: {
              invoke: {
                id: 'prepareEmailAddressCodeVerification',
                src: 'prepareEmailAddressVerification',
                input: ({ context }) => ({
                  clerk: context.clerk,
                  params: {
                    strategy: 'email_code',
                    redirectUrl: context.clerk.buildAfterSignUpUrl(),
                  },
                }),
                onDone: {
                  actions: 'assignResource',
                  target: 'AwaitingInput',
                },
              },
            },
            AwaitingInput: {},
            Attempting: {},
            Success: {
              type: 'final',
            },
          },
        },
        PhoneCode: {
          initial: 'Init',
          states: {
            Init: {
              always: [
                {
                  guard: {
                    type: 'shouldAvoidPrepare',
                    params: {
                      key: 'phoneNumber' as const,
                    },
                  },
                  target: 'AwaitingInput',
                },
                {
                  target: 'Preparing',
                },
              ],
            },
            Preparing: {
              invoke: {
                id: 'preparePhoneNumberVerification',
                src: 'preparePhoneNumberVerification',
                input: ({ context }) => ({
                  clerk: context.clerk,
                }),
                onDone: {
                  actions: 'assignResource',
                  target: 'AwaitingInput',
                },
              },
            },
            Attempting: {},
            AwaitingInput: {},
            Success: {
              type: 'final',
            },
          },
        },
        Success: {
          type: 'final',
        },
      },
      onDone: {
        target: 'Complete',
      },
    },
    HavingTrouble: {
      id: 'HavingTrouble',
      always: 'Start',
    },
    NotImplemented: {
      entry: log('Not implemented.'),
      always: 'Start',
    },
    Complete: {
      id: 'Complete',
      type: 'final',
      entry: 'setAsActive',
    },
  },
});
