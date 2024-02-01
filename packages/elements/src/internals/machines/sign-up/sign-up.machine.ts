import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type {
  Attribute,
  LoadedClerk,
  OAuthStrategy,
  SamlStrategy,
  SignUpField,
  SignUpResource,
  SignUpVerifiableField,
  SignUpVerificationsResource,
  VerificationStatus,
  VerificationStrategy,
  Web3Strategy,
} from '@clerk/types';
import type { ActorRefFrom, ErrorActorEvent, MachineContext } from 'xstate';
import { and, assertEvent, assign, enqueueActions, log, sendTo, setup } from 'xstate';

import type { ClerkElementsErrorBase } from '~/internals/errors/error';
import { ClerkElementsRuntimeError } from '~/internals/errors/error';
import type { FormMachine } from '~/internals/machines/form/form.machine';
import type { ClerkLoaderEvents } from '~/internals/machines/shared.actors';
import { clerkLoader, handleRedirectCallback } from '~/internals/machines/shared.actors';
import {
  attemptVerification,
  authenticateWithSignUpRedirect,
  createSignUp,
  prepareVerification,
  startSignUpEmailLinkFlow,
  updateSignUp,
} from '~/internals/machines/sign-up/sign-up.actors';
import { assertActorEventError } from '~/internals/machines/utils/assert';
import type { ClerkJSNavigationEvent } from '~/internals/machines/utils/clerkjs';
import type { ClerkRouter } from '~/react/router';
import { type EnabledThirdPartyProviders, getEnabledThirdPartyProviders } from '~/utils/third-party-strategies';

type SignUpVerificationsResourceKey = keyof SignUpVerificationsResource;

export interface SignUpMachineContext extends MachineContext {
  clerk: LoadedClerk;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
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
  | ClerkLoaderEvents
  | { type: 'AUTHENTICATE.OAUTH'; strategy: OAuthStrategy }
  | { type: 'AUTHENTICATE.SAML'; strategy: SamlStrategy }
  | { type: 'AUTHENTICATE.WEB3'; strategy: Web3Strategy }
  | { type: 'FAILURE'; error: Error }
  | { type: 'OAUTH.CALLBACK' }
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS' }
  | { type: 'NEXT' }
  | { type: 'EMAIL_LINK.VERIFIED'; resource: SignUpResource }
  | { type: 'EMAIL_LINK.EXPIRED'; resource: SignUpResource }
  | { type: 'EMAIL_LINK.RESTART' }
  | { type: 'EMAIL_LINK.FAILURE'; error: Error }
  | { type: ClerkJSNavigationEvent };

export type SignUpVerificationTags = 'code' | VerificationStrategy;

export type SignUpStateTags = 'state:start' | 'state:continue' | 'state:verification';

export type SignUpTags = SignUpStateTags | SignUpVerificationTags | 'external';
export type SignUpDelays = 'TIMEOUT.POLLING';

export interface SignUpMachineSchema {
  context: SignUpMachineContext;
  input: SignUpMachineInput;
  events: SignUpMachineEvents;
  tags: SignUpTags;
  delays: SignUpDelays;
}

export const SignUpMachine = setup({
  actors: {
    // Root
    clerkLoader,

    // Start
    createSignUp,

    // Continue
    updateSignUp,

    // Verification
    prepareVerification,
    attemptVerification,
    startSignUpEmailLinkFlow,

    // OAuth & Web3
    authenticateWithSignUpRedirect,

    // Callbacks
    handleRedirectCallback,
  },
  actions: {
    assignThirdPartyProviders: assign({
      thirdPartyProviders: ({ context }) => getEnabledThirdPartyProviders(context.clerk.__unstable__environment),
    }),
    goToNextState: sendTo(({ self }) => self, { type: 'NEXT' }),
    navigateTo({ context }, { path }: { path: string }) {
      context.router.replace(path);
    },
    raiseFailure: ({ event, self }, { error }: { error: string | ClerkElementsErrorBase }) => {
      let selectedError: Error = typeof error === 'string' ? new ClerkElementsRuntimeError(error) : error;

      if (!selectedError) {
        assertActorEventError(event);
        selectedError = event.error;
      }

      return sendTo(self, {
        type: 'FAILURE',
        error: selectedError,
      });
    },
    setAsActive: ({ context }) => {
      const beforeEmit = () => context.router.push(context.clerk.buildAfterSignUpUrl());
      void context.clerk.setActive({ session: context.clerk.client.signUp.createdSessionId, beforeEmit });
    },
    // Necessary?
    setGlobalError: ({ context }, { error }: { error: ClerkElementsErrorBase }) =>
      sendTo(context.formRef, {
        type: 'ERRORS.SET',
        error,
      }),
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
    areFieldsMissing: ({ context }) => context.clerk.client.signUp.missingFields.length > 0,
    areFieldsUnverified: ({ context }) => context.clerk.client.signUp.unverifiedFields.length > 0,
    currentPathMatches: ({ context }, { regex }: { regex: RegExp }) =>
      regex ? Boolean(context.router.pathname()?.match(regex)) : false,
    isComplete: ({ context }) => context.clerk.client.signUp.status === 'complete',
    isFieldMissing: ({ context }, { field }: { field: SignUpField }) =>
      context.clerk.client.signUp.missingFields.includes(field),
    isFieldUnverified: ({ context }, { field }: { field: SignUpVerifiableField }) =>
      context.clerk.client.signUp.unverifiedFields.includes(field),
    isStrategyEnabled: (
      { context },
      { attribute, strategy }: { attribute: Attribute; strategy: VerificationStrategy },
    ) =>
      Boolean(
        context.clerk.__unstable__environment?.userSettings.attributes[attribute].verifications.includes(strategy),
      ),
    isMissingRequiredFields: and(['isStatusMissingRequirements', 'areFieldsMissing']),
    isMissingRequiredUnverifiedFields: and(['isStatusMissingRequirements', 'areFieldsUnverified']),
    isStatusAbandoned: ({ context }) => context.clerk.client.signUp.status === 'abandoned',
    isStatusComplete: ({ context }) => context?.clerk.client.signUp.status === 'complete',
    isStatusMissingRequirements: ({ context }) => context.clerk.client.signUp.status === 'missing_requirements',
    isVerificationStatusExpired: (
      { context },
      params: { strategy: SignUpVerificationsResourceKey; status: VerificationStatus },
    ) => context.clerk.client.signUp.verifications[params.strategy].status === 'expired',
    shouldVerifyPhoneCode: and([
      {
        type: 'isFieldUnverified',
        params: {
          field: 'phone_number' as const,
        },
      },
    ]),
    shouldVerifyEmailLink: and([
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
    shouldVerifyEmailCode: and([
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
  types: {} as SignUpMachineSchema,
}).createMachine({
  id: 'SignUp',
  context: ({ input }) => ({
    clerk: input.clerk,
    formRef: input.form,
    router: input.router,
    thirdPartyProviders: getEnabledThirdPartyProviders(input.clerk.__unstable__environment),
  }),
  initial: 'Init',
  on: {
    'CLERKJS.NAVIGATE.*': {
      actions: {
        type: 'raiseFailure',
        params: {
          error: 'Having trouble?',
        },
      },
    },
    FAILURE: {
      actions: sendTo(
        ({ context }) => context.formRef,
        ({ event }) => ({
          type: 'ERRORS.SET',
          error: event.error,
        }),
      ),
      target: '.Start',
    },
  },
  states: {
    Init: {
      invoke: {
        id: 'clerkLoader',
        src: 'clerkLoader',
        input: ({ context }) => context.clerk,
      },
      on: {
        'CLERK.READY': [
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
      on: {
        'CLERKJS.NAVIGATE.*': {
          actions: enqueueActions(({ enqueue, check, event }) => {
            if (check('isComplete')) {
              return enqueue('setAsActive');
            }

            if (event.type === 'CLERKJS.NAVIGATE.SIGN_IN') {
              return enqueue({
                type: 'navigateTo',
                params: {
                  path: '/sign-up',
                },
              });
            }

            return enqueue('goToNextState');
          }),
        },
      },
      invoke: {
        id: 'handleRedirectCallback',
        src: 'handleRedirectCallback',
        input: ({ context }) => context.clerk,
        onError: {
          actions: 'setFormErrors',
        },
      },
    },
    Start: {
      id: 'Start',
      tags: 'state:start',
      description: 'The intial state of the sign-up flow.',
      entry: 'assignThirdPartyProviders',
      initial: 'AwaitingInput',
      on: {
        'AUTHENTICATE.OAUTH': '#SignUp.AuthenticatingWithRedirect',
        'AUTHENTICATE.SAML': '#SignUp.AuthenticatingWithRedirect',
        NEXT: [
          {
            guard: 'isMissingRequiredUnverifiedFields',
            target: 'Verification',
          },
          {
            guard: 'isMissingRequiredFields',
            target: 'Continue',
          },
          {
            guard: 'isStatusComplete',
            actions: 'setAsActive',
            target: 'Complete',
          },
        ],
      },
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
              actions: 'goToNextState',
            },
            onError: {
              actions: 'setFormErrors',
              target: 'AwaitingInput',
            },
          },
        },
      },
    },
    Continue: {
      tags: 'state:continue',
      initial: 'AwaitingInput',
      on: {
        NEXT: [
          {
            guard: 'isMissingRequiredUnverifiedFields',
            target: 'Verification',
          },
          {
            guard: 'isStatusComplete',
            target: 'Complete',
          },
        ],
      },
      states: {
        AwaitingInput: {
          on: {
            SUBMIT: {
              target: 'Attempting',
              reenter: true,
            },
          },
        },
        Attempting: {
          invoke: {
            id: 'updateSignUp',
            src: 'updateSignUp',
            input: ({ context }) => ({
              clerk: context.clerk,
              fields: context.formRef.getSnapshot().context.fields,
            }),
            onDone: {
              actions: 'goToNextState',
            },
            onError: {
              actions: 'setFormErrors',
              target: 'AwaitingInput',
            },
          },
        },
      },
    },
    Verification: {
      tags: 'state:verification',
      description: 'Verification state of the sign-up flow',
      initial: 'Init',
      on: {
        NEXT: [
          {
            guard: 'isStatusComplete',
            target: 'Complete',
          },
          {
            guard: 'isMissingRequiredFields',
            target: 'Continue',
            reenter: true,
          },
          {
            guard: 'isMissingRequiredUnverifiedFields',
            target: 'Verification',
            reenter: true,
          },
          {
            target: 'Start',
            reenter: true,
          },
        ],
      },
      states: {
        Init: {
          always: [
            {
              description: 'Validate via phone number',
              guard: 'shouldVerifyPhoneCode',
              target: 'PhoneCode',
            },
            {
              description: 'Validate via email link',
              guard: 'shouldVerifyEmailLink',
              target: 'EmailLink',
            },
            {
              description: 'Verify via email code',
              guard: 'shouldVerifyEmailCode',
              target: 'EmailCode',
            },
            {
              actions: {
                type: 'raiseFailure',
                params: {
                  error: 'No verification strategy found',
                },
              },
            },
          ],
        },
        EmailLink: {
          tags: 'email_link',
          initial: 'Init',
          on: {
            'EMAIL_LINK.VERIFIED': {
              // event.output.verifications.emailAddress.verifiedFromTheSameClient (TODO: MODAL?)
              actions: 'goToNextState',
            },
            'EMAIL_LINK.EXPIRED': {
              actions: {
                type: 'raiseFailure',
                params: {
                  error: 'Email link verification has expired',
                },
              },
            },
            'EMAIL_LINK.RESTART': {
              actions: sendTo('signUpEmailLinkFlow', { type: 'STOP' }),
              target: '.Attempting',
              reenter: true,
            },
            'EMAIL_LINK.FAILURE': {
              actions: sendTo(
                ({ self }) => self,
                ({ event }) => ({
                  type: 'FAILURE',
                  error: event.error,
                }),
              ),
            },
          },
          states: {
            Init: {
              invoke: {
                id: 'prepareEmailAddressLinkVerification',
                src: 'prepareVerification',
                input: ({ context }) => ({
                  clerk: context.clerk,
                  params: {
                    strategy: 'email_link',
                    redirectUrl: context.clerk.buildAfterSignUpUrl(),
                  },
                  skipIfVerified: 'emailAddress',
                }),
                onDone: 'Attempting',
              },
            },
            Attempting: {
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
                    sendTo(({ self }) => self, {
                      type: 'FAILURE',
                      error: new ClerkElementsRuntimeError('Email link verification timed out.'),
                    }),
                  ],
                },
              },
            },
          },
        },
        EmailCode: {
          tags: ['email_code', 'code'],
          initial: 'Init',
          states: {
            Init: {
              invoke: {
                id: 'prepareEmailAddressCodeVerification',
                src: 'prepareVerification',
                input: ({ context }) => ({
                  clerk: context.clerk,
                  params: {
                    strategy: 'email_code',
                  },
                  skipIfVerified: 'emailAddress',
                }),
                onDone: 'AwaitingInput',
              },
            },
            AwaitingInput: {
              on: {
                SUBMIT: {
                  target: 'Attempting',
                  reenter: true,
                },
              },
            },
            Attempting: {
              invoke: {
                id: 'attemptEmailAddressCodeVerification',
                src: 'attemptVerification',
                input: ({ context }) => ({
                  clerk: context.clerk,
                  params: {
                    strategy: 'email_code',
                    code: (context.formRef.getSnapshot().context.fields.get('code')?.value as string) || '',
                  },
                }),
                onDone: {
                  actions: 'goToNextState',
                },
                onError: {
                  actions: 'setFormErrors',
                  target: 'AwaitingInput',
                },
              },
            },
          },
        },
        PhoneCode: {
          tags: ['phone_code', 'code'],
          initial: 'Init',
          states: {
            Init: {
              invoke: {
                id: 'preparePhoneCodeVerification',
                src: 'prepareVerification',
                input: ({ context }) => ({
                  clerk: context.clerk,
                  params: {
                    strategy: 'phone_code',
                  },
                  skipIfVerified: 'phoneNumber',
                }),
                onDone: 'AwaitingInput',
              },
            },
            AwaitingInput: {
              on: {
                SUBMIT: {
                  target: 'Attempting',
                  reenter: true,
                },
              },
            },
            Attempting: {
              invoke: {
                id: 'attemptPhoneNumberVerification',
                src: 'attemptVerification',
                input: ({ context }) => ({
                  clerk: context.clerk,
                  params: {
                    strategy: 'phone_code',
                    code: (context.formRef.getSnapshot().context.fields.get('code')?.value as string) || '',
                  },
                }),
                onDone: {
                  actions: 'goToNextState',
                },
                onError: {
                  actions: 'setFormErrors',
                  target: 'AwaitingInput',
                },
              },
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
      always: 'Start',
    },
    Complete: {
      id: 'Complete',
      type: 'final',
      entry: 'setAsActive',
    },
  },
});
