import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type {
  Attribute,
  LoadedClerk,
  OAuthStrategy,
  SamlStrategy,
  SignUpField,
  SignUpResource,
  SignUpStatus,
  SignUpVerifiableField,
  SignUpVerificationsResource,
  VerificationStatus,
  VerificationStrategy,
  Web3Strategy,
} from '@clerk/types';
import type { Writable } from 'type-fest';
import type { ActorRefFrom, ErrorActorEvent, MachineContext, NonReducibleUnknown } from 'xstate';
import { and, log, not, or, sendTo, setup } from 'xstate';

import { SSO_CALLBACK_PATH_ROUTE } from '~/internals/constants';
import type { ClerkElementsErrorBase } from '~/internals/errors/error';
import { ClerkElementsRuntimeError } from '~/internals/errors/error';
import type { FormMachine } from '~/internals/machines/form/form.machine';
import {
  attemptVerification,
  createSignUp,
  prepareVerification,
  startSignUpEmailLinkFlow,
  updateSignUp,
} from '~/internals/machines/sign-up/sign-up.actors';
import { THIRD_PARTY_MACHINE_ID, ThirdPartyMachine } from '~/internals/machines/third-party/machine';
import { assertActorEventError } from '~/internals/machines/utils/assert';
import type { ClerkJSNavigationEvent } from '~/internals/machines/utils/clerkjs';
import type { ClerkRouter } from '~/react/router';

type SignUpVerificationsResourceKey = keyof SignUpVerificationsResource;

export interface SignUpMachineContext extends MachineContext {
  clerk: LoadedClerk;
  error?: Error | ClerkAPIResponseError;
  formRef: ActorRefFrom<typeof FormMachine>;
  router: ClerkRouter;
}

export interface SignUpMachineInput {
  clerk: LoadedClerk;
  form: ActorRefFrom<typeof FormMachine>;
  router: ClerkRouter;
}

export type SignUpMachineEvents =
  | ErrorActorEvent
  | { type: 'AUTHENTICATE.OAUTH'; strategy: OAuthStrategy }
  | { type: 'AUTHENTICATE.SAML'; strategy?: SamlStrategy }
  | { type: 'AUTHENTICATE.WEB3'; strategy: Web3Strategy }
  | { type: 'FAILURE'; error: Error }
  | { type: 'OAUTH.CALLBACK' }
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS' }
  | { type: 'NEXT' }
  | { type: 'EMAIL_LINK.VERIFIED'; resource: SignUpResource }
  | { type: 'EMAIL_LINK.EXPIRED'; resource: SignUpResource }
  | { type: 'EMAIL_LINK.RESTART' }
  | { type: 'EMAIL_LINK.FAILED'; error: Error }
  | { type: ClerkJSNavigationEvent };

export type SignUpVerificationTags = 'code' | VerificationStrategy;

export type SignUpStateTags = 'state:start' | 'state:continue' | 'state:verification' | 'state:callback';

export type SignUpTags = SignUpStateTags | SignUpVerificationTags | 'external';
export type SignUpDelays = 'TIMEOUT.POLLING';

export interface SignUpMachineSchema {
  context: SignUpMachineContext;
  input: SignUpMachineInput;
  events: SignUpMachineEvents;
  tags: SignUpTags;
  delays: SignUpDelays;
}

const isCurrentPath =
  (path: `/${string}`) =>
  ({ context }: { context: SignUpMachineContext }, _params?: NonReducibleUnknown) =>
    context.router.match(path);

const needsStatus =
  (status: SignUpStatus) =>
  ({ context }: { context: SignUpMachineContext }, _params?: NonReducibleUnknown) =>
    context.clerk.client.signUp.status === status;

const shouldVerify = (field: SignUpVerifiableField, strategy?: VerificationStrategy) => {
  const guards: Writable<Parameters<typeof and<SignUpMachineContext, SignUpMachineEvents, any>>[0]> = [
    {
      type: 'isFieldUnverified',
      params: {
        field,
      },
    },
  ];

  if (strategy) {
    guards.push({
      type: 'isStrategyEnabled',
      params: {
        attribute: field,
        strategy,
      },
    });
  }

  return and(guards);
};

export const SignUpMachine = setup({
  actors: {
    // Start
    createSignUp,

    // Continue
    updateSignUp,

    // Verification
    prepareVerification,
    attemptVerification,
    startSignUpEmailLinkFlow,

    ThirdPartyMachine,
  },
  actions: {
    goToNextState: sendTo(({ self }) => self, { type: 'NEXT' }),
    navigateTo({ context }, { path }: { path: string }) {
      context.router.replace(path);
    },
    navigateInternal({ context }, { path }: { path: string }) {
      const resolvedPath = [context.router.basePath, path].join('/').replace(/\/\/g/, '/');
      if (resolvedPath === context.router.pathname()) return;
      context.router.replace(resolvedPath);
    },
    navigateExternal({ context }, { path }: { path: string }) {
      context.router.push(path);
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
    hasResource: ({ context }) => Boolean(context.clerk.client.signUp),

    isActivePathRoot: isCurrentPath('/'),
    isActivePathContinue: isCurrentPath('/continue'),
    isActivePathCallback: isCurrentPath('/sso-callback'),
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
    isLoggedIn: ({ context }) => Boolean(context.clerk.user),
    isMissingRequiredFields: and(['isStatusMissingRequirements', 'areFieldsMissing']),
    isMissingRequiredUnverifiedFields: and(['isStatusMissingRequirements', 'areFieldsUnverified']),
    isStatusAbandoned: needsStatus('abandoned'),
    isStatusComplete: needsStatus('complete'),
    isStatusMissingRequirements: needsStatus('missing_requirements'),
    isVerificationStatusExpired: (
      { context },
      params: { strategy: SignUpVerificationsResourceKey; status: VerificationStatus },
    ) => context.clerk.client.signUp.verifications[params.strategy].status === 'expired',
    needsIdentifier: or([not('hasResource'), 'isActivePathRoot']),
    needsContinue: and(['isMissingRequiredFields', 'isActivePathContinue']),
    needsVerification: and(['isMissingRequiredUnverifiedFields', 'isActivePathContinue']),
    needsCallback: isCurrentPath('/sso-callback'),
    shouldVerifyPhoneCode: shouldVerify('phone_number'),
    shouldVerifyEmailLink: shouldVerify('email_address', 'email_link'),
    shouldVerifyEmailCode: shouldVerify('email_address', 'email_code'),
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
  }),
  initial: 'Init',
  invoke: {
    id: THIRD_PARTY_MACHINE_ID,
    systemId: THIRD_PARTY_MACHINE_ID,
    src: 'ThirdPartyMachine',
    input: ({ context }) => ({
      basePath: context.router.basePath,
      clerk: context.clerk,
      flow: 'signUp',
    }),
  },
  on: {
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
    NEXT: [
      {
        guard: 'isStatusComplete',
        actions: log('isStatusComplete'),
        target: '.LoggingIn',
      },
      {
        guard: 'isLoggedIn',
        actions: [
          log('isLoggedIn'),
          { type: 'navigateExternal', params: ({ context }) => ({ path: context.clerk.buildAfterSignInUrl() }) },
        ],
      },
      {
        guard: 'needsIdentifier',
        actions: log('needsIdentifier'),
        target: '.Start',
        reenter: true,
      },
      {
        guard: 'needsContinue',
        actions: log('needsContinue'),
        target: '.Continue',
        reenter: true,
      },
      {
        guard: 'needsVerification',
        actions: log('needsVerification'),
        target: '.Verification',
        reenter: true,
      },
      {
        guard: 'needsCallback',
        actions: [
          log('needsCallback'),
          sendTo(THIRD_PARTY_MACHINE_ID, ({ context }) => ({
            type: 'CALLBACK',
            redirectUrl: `${context.router.basePath}/${SSO_CALLBACK_PATH_ROUTE}`,
          })),
        ],
        target: '.Callback',
      },
      {
        target: '.Start',
        reenter: true,
      },
    ],
  },
  states: {
    Init: {
      entry: 'goToNextState',
    },
    Start: {
      id: 'Start',
      tags: 'state:start',
      description: 'The intial state of the sign-in flow.',
      initial: 'AwaitingInput',
      on: {
        'AUTHENTICATE.OAUTH': {
          actions: sendTo(THIRD_PARTY_MACHINE_ID, ({ event }) => ({
            type: 'REDIRECT',
            params: { strategy: event.strategy },
          })),
        },
        'AUTHENTICATE.SAML': {
          actions: sendTo(THIRD_PARTY_MACHINE_ID, {
            type: 'REDIRECT',
            params: { strategy: 'saml' },
          }),
        },
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
            target: 'LoggingIn',
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
            guard: 'isMissingRequiredFields',
            target: 'Continue',
          },
          {
            guard: 'isMissingRequiredUnverifiedFields',
            target: 'Verification',
          },
          {
            guard: 'isStatusComplete',
            target: 'LoggingIn',
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
            target: 'LoggingIn',
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
          // {
          //   target: 'Start',
          //   reenter: true,
          // },
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
            'EMAIL_LINK.FAILED': {
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
    Callback: {
      tags: 'state:callback',
      on: {
        'CLERKJS.NAVIGATE.SIGN_IN': {
          actions: {
            type: 'navigateExternal',
            params: {
              path: '/sign-in',
            },
          },
        },
        'CLERKJS.NAVIGATE.SIGN_UP': {
          actions: {
            type: 'navigateExternal',
            params: {
              path: '/sign-up',
            },
          },
        },
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
            target: 'LoggingIn',
          },
        ],
      },
    },
    LoggingIn: {
      type: 'final',
      entry: 'setAsActive',
    },
  },
});
