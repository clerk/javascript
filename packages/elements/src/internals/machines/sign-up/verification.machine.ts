import { Poller } from '@clerk/shared/poller';
import type {
  AttemptVerificationParams,
  Attribute,
  PrepareVerificationParams,
  SignUpResource,
  SignUpVerifiableField,
  SignUpVerificationsResource,
  VerificationStrategy,
} from '@clerk/shared/types';
import type { Writable } from 'type-fest';
import { and, assign, enqueueActions, fromCallback, fromPromise, log, raise, sendParent, sendTo, setup } from 'xstate';

import {
  MAGIC_LINK_VERIFY_PATH_ROUTE,
  RESENDABLE_COUNTDOWN_DEFAULT,
  SIGN_UP_DEFAULT_BASE_PATH,
} from '~/internals/constants';
import { ClerkElementsError, ClerkElementsRuntimeError } from '~/internals/errors';
import type { WithParams } from '~/internals/machines/shared';
import { sendToLoading } from '~/internals/machines/shared';
import { assertActorEventError } from '~/internals/machines/utils/assert';

import type { SignInRouterMachineActorRef } from './router.types';
import {
  type SignUpVerificationContext,
  SignUpVerificationDelays,
  type SignUpVerificationEmailLinkFailedEvent,
  type SignUpVerificationEvents,
  type SignUpVerificationSchema,
} from './verification.types';

export type SignUpVerificationsResourceKey = keyof SignUpVerificationsResource;
export type TSignUpVerificationMachine = typeof SignUpVerificationMachine;

export type StartSignUpEmailLinkFlowEvents = { type: 'STOP' };
export type StartSignUpEmailLinkFlowInput = {
  parent: SignInRouterMachineActorRef;
};

export const SignUpVerificationMachineId = 'SignUpVerification';

const shouldVerify = (field: SignUpVerifiableField, strategy?: VerificationStrategy) => {
  const guards: Writable<Parameters<typeof and<SignUpVerificationContext, SignUpVerificationEvents, any>>[0]> = [
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

export type PrepareVerificationInput = {
  parent: SignInRouterMachineActorRef;
} & WithParams<PrepareVerificationParams>;
export type AttemptVerificationInput = {
  parent: SignInRouterMachineActorRef;
} & WithParams<AttemptVerificationParams>;

export const SignUpVerificationMachine = setup({
  actors: {
    prepare: fromPromise<SignUpResource, PrepareVerificationInput>(({ input: { params, parent } }) => {
      const clerk = parent.getSnapshot().context.clerk;

      if (params.strategy === 'email_link' && params.redirectUrl) {
        params.redirectUrl = clerk.buildUrlWithAuth(params.redirectUrl);
      }

      return clerk.client.signUp.prepareVerification(params);
    }),
    attempt: fromPromise<SignUpResource, AttemptVerificationInput>(async ({ input: { params, parent } }) =>
      parent.getSnapshot().context.clerk.client.signUp.attemptVerification(params),
    ),
    attemptEmailLinkVerification: fromCallback<StartSignUpEmailLinkFlowEvents, StartSignUpEmailLinkFlowInput>(
      ({ receive, sendBack, input: { parent } }) => {
        const { run, stop } = Poller();

        const clerk = parent.getSnapshot().context.clerk;

        void run(async () =>
          clerk.client.signUp
            .reload()
            .then((resource: SignUpResource) => {
              const signInStatus = resource.status;
              const verificationStatus = resource.verifications.emailAddress.status;

              // Short-circuit if the sign-up resource is already complete
              if (signInStatus === 'complete') {
                return sendBack({ type: 'EMAIL_LINK.VERIFIED', resource });
              }

              switch (verificationStatus) {
                case 'verified':
                case 'transferable':
                case 'expired': {
                  sendBack({ type: `EMAIL_LINK.${verificationStatus.toUpperCase()}`, resource });
                  break;
                }
                case 'failed': {
                  sendBack({
                    type: 'EMAIL_LINK.FAILED',
                    error: new ClerkElementsError('email-link-verification-failed', 'Email verification failed'),
                    resource,
                  });
                  break;
                }
                // case 'unverified':
                default:
                  return;
              }

              stop();
            })
            .catch((error: Error) => {
              stop();
              new ClerkElementsRuntimeError(error.message);
            }),
        );

        receive(event => {
          if (event.type === 'STOP') {
            stop();
          }
        });

        return () => stop();
      },
    ),
  },
  actions: {
    resendableTick: assign(({ context }) => ({
      resendable: context.resendableAfter === 1,
      resendableAfter: context.resendableAfter > 1 ? context.resendableAfter - 1 : context.resendableAfter,
    })),
    resendableReset: assign({
      resendable: false,
      resendableAfter: RESENDABLE_COUNTDOWN_DEFAULT,
    }),
    sendToLoading,
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
    isComplete: ({ context }) => context.resource.status === 'complete',
    isFieldUnverified: ({ context, event }, { field }: { field: SignUpVerifiableField }) => {
      let resource = context.resource;

      if (event?.type === 'NEXT' && event.resource) {
        resource = event.resource;
      }

      return resource.unverifiedFields.includes(field);
    },
    isResendable: ({ context }) => context.resendable || context.resendableAfter === 0,
    isStrategyEnabled: (
      { context },
      { attribute, strategy }: { attribute: Attribute; strategy: VerificationStrategy },
    ) => Boolean(context.attributes?.[attribute].verifications.includes(strategy)),
    shouldVerifyPhoneCode: shouldVerify('phone_number'),
    shouldVerifyEmailLink: shouldVerify('email_address', 'email_link'),
    shouldVerifyEmailCode: shouldVerify('email_address', 'email_code'),
  },
  delays: SignUpVerificationDelays,
  types: {} as SignUpVerificationSchema,
}).createMachine({
  id: SignUpVerificationMachineId,
  initial: 'Init',
  context: ({ input }) => ({
    attributes: input.attributes,
    basePath: input.basePath || SIGN_UP_DEFAULT_BASE_PATH,
    loadingStep: 'verifications',
    formRef: input.formRef,
    parent: input.parent,
    resendable: false,
    resendableAfter: RESENDABLE_COUNTDOWN_DEFAULT,
    resource: input.resource,
  }),
  on: {
    NEXT: [
      {
        guard: 'isComplete',
        actions: sendParent(({ event }) => ({ type: 'NEXT', resource: event.resource })),
      },
      {
        description: 'Validate via phone number',
        guard: 'shouldVerifyPhoneCode',
        target: '.PhoneCode',
      },
      {
        description: 'Validate via email link',
        guard: 'shouldVerifyEmailLink',
        target: '.EmailLink',
      },
      {
        description: 'Verify via email code',
        guard: 'shouldVerifyEmailCode',
        target: '.EmailCode',
      },
      {
        actions: sendParent(({ event }) => ({ type: 'NEXT', resource: event.resource })),
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
          actions: sendParent(({ context }) => ({ type: 'NEXT', resource: context.resource })),
        },
      ],
    },
    EmailLink: {
      tags: ['verification:method:email', 'verification:category:link', 'verification:email_link'],
      initial: 'Preparing',
      on: {
        RETRY: '.Preparing',
        'EMAIL_LINK.RESTART': {
          target: '.Attempting',
          reenter: true,
        },
        'EMAIL_LINK.FAILED': {
          actions: [
            {
              type: 'setFormErrors',
              params: ({ event }: { event: SignUpVerificationEmailLinkFailedEvent }) => ({ error: event.error }),
            },
            assign({ resource: ({ event }) => event.resource }),
          ],
          target: '.Pending',
        },
        'EMAIL_LINK.*': {
          actions: enqueueActions(({ enqueue, event }) => {
            if (event.type === 'EMAIL_LINK.RESTART') {
              return;
            }

            enqueue.assign({ resource: event.resource });
            enqueue.raise({ type: 'NEXT', resource: event.resource });
          }),
        },
      },
      states: {
        Preparing: {
          tags: ['state:preparing', 'state:loading'],
          exit: 'resendableReset',
          invoke: {
            id: 'prepareEmailLinkVerification',
            src: 'prepare',
            input: ({ context }) => ({
              parent: context.parent,
              params: {
                strategy: 'email_link',
                redirectUrl: `${context.basePath}${MAGIC_LINK_VERIFY_PATH_ROUTE}`,
              },
            }),
            onDone: {
              target: 'Attempting',
              actions: assign({ resource: ({ event }) => event.output }),
            },
            onError: {
              actions: 'setFormErrors',
              target: 'Pending',
            },
          },
        },
        Pending: {
          description: 'Placeholder for allowing resending of email link',
          tags: ['state:pending'],
          on: {
            NEXT: 'Preparing',
          },
        },
        Attempting: {
          tags: ['state:attempting'],
          invoke: {
            id: 'attemptEmailLinkVerification',
            src: 'attemptEmailLinkVerification',
            input: ({ context }) => ({
              parent: context.parent,
            }),
          },
          after: {
            emailLinkTimeout: {
              description: 'Timeout after 5 minutes',
              target: 'Pending',
              actions: sendTo(({ context }) => context.formRef, {
                type: 'ERRORS.SET',
                error: new ClerkElementsError('verify-email-link-timeout', 'Email link verification timed out'),
              }),
            },
          },
          initial: 'NotResendable',
          states: {
            Resendable: {
              description: 'Waiting for user to retry',
            },
            NotResendable: {
              description: 'Handle countdowns',
              on: {
                RETRY: {
                  actions: log(({ context }) => `Not retriable; Try again in ${context.resendableAfter}s`),
                },
              },
              after: {
                resendableTimeout: [
                  {
                    description: 'Set as retriable if countdown is 0',
                    guard: 'isResendable',
                    actions: 'resendableTick',
                    target: 'Resendable',
                  },
                  {
                    description: 'Continue countdown if not retriable',
                    actions: 'resendableTick',
                    target: 'NotResendable',
                    reenter: true,
                  },
                ],
              },
            },
          },
        },
      },
    },
    EmailCode: {
      tags: ['verification:method:email', 'verification:category:code', 'verification:email_code'],
      initial: 'Preparing',
      states: {
        Preparing: {
          tags: ['state:preparing', 'state:loading'],
          exit: 'resendableReset',
          invoke: {
            id: 'prepareEmailAddressCodeVerification',
            src: 'prepare',
            input: ({ context }) => ({
              parent: context.parent,
              params: {
                strategy: 'email_code',
              },
            }),
            onDone: [
              {
                guard: 'shouldVerifyEmailCode',
                target: 'Pending',
              },
              {
                actions: [
                  assign({ resource: ({ event }) => event.output }),
                  raise(({ event }) => ({ type: 'NEXT', resource: event.output })),
                ],
              },
            ],
            onError: {
              actions: 'setFormErrors',
              target: 'Pending',
            },
          },
        },
        Pending: {
          tags: ['state:pending'],
          on: {
            RETRY: 'Preparing',
            SUBMIT: {
              target: 'Attempting',
              reenter: true,
            },
          },
          initial: 'NotResendable',
          states: {
            Resendable: {
              description: 'Waiting for user to retry',
            },
            NotResendable: {
              description: 'Handle countdowns',
              on: {
                RETRY: {
                  actions: log(({ context }) => `Not retriable; Try again in ${context.resendableAfter}s`),
                },
              },
              after: {
                resendableTimeout: [
                  {
                    description: 'Set as retriable if countdown is 0',
                    guard: 'isResendable',
                    actions: 'resendableTick',
                    target: 'Resendable',
                  },
                  {
                    description: 'Continue countdown if not retriable',
                    actions: 'resendableTick',
                    target: 'NotResendable',
                    reenter: true,
                  },
                ],
              },
            },
          },
        },
        Attempting: {
          tags: ['state:attempting', 'state:loading'],
          entry: 'sendToLoading',
          invoke: {
            id: 'attemptEmailAddressCodeVerification',
            src: 'attempt',
            input: ({ context }) => ({
              parent: context.parent,
              params: {
                strategy: 'email_code',
                code: (context.formRef.getSnapshot().context.fields.get('code')?.value as string) || '',
              },
            }),
            onDone: {
              actions: [raise(({ event }) => ({ type: 'NEXT', resource: event.output })), 'sendToLoading'],
            },
            onError: {
              actions: ['setFormErrors', 'sendToLoading'],
              target: 'Pending',
            },
          },
        },
      },
    },
    PhoneCode: {
      tags: ['verification:method:phone', 'verification:category:code', 'verification:phone_code'],
      initial: 'Preparing',
      states: {
        Preparing: {
          tags: ['state:preparing', 'state:loading'],
          exit: 'resendableReset',
          invoke: {
            id: 'preparePhoneCodeVerification',
            src: 'prepare',
            input: ({ context }) => ({
              parent: context.parent,
              params: {
                strategy: 'phone_code',
              },
            }),
            onDone: [
              {
                guard: 'shouldVerifyPhoneCode',
                target: 'Pending',
                actions: assign({ resource: ({ event }) => event.output }),
              },
              {
                actions: [
                  assign({ resource: ({ event }) => event.output }),
                  raise(({ event }) => ({ type: 'NEXT', resource: event.output })),
                ],
              },
            ],
            onError: {
              actions: 'setFormErrors',
              target: 'Pending',
            },
          },
        },
        Pending: {
          tags: ['state:pending'],
          on: {
            RETRY: 'Preparing',
            SUBMIT: {
              target: 'Attempting',
              reenter: true,
            },
          },
          initial: 'NotResendable',
          states: {
            Resendable: {
              description: 'Waiting for user to retry',
            },
            NotResendable: {
              description: 'Handle countdowns',
              on: {
                RETRY: {
                  actions: log(({ context }) => `Not retriable; Try again in ${context.resendableAfter}s`),
                },
              },
              after: {
                resendableTimeout: [
                  {
                    description: 'Set as retriable if countdown is 0',
                    guard: 'isResendable',
                    actions: 'resendableTick',
                    target: 'Resendable',
                  },
                  {
                    description: 'Continue countdown if not retriable',
                    actions: 'resendableTick',
                    target: 'NotResendable',
                    reenter: true,
                  },
                ],
              },
            },
          },
        },
        Attempting: {
          tags: ['state:attempting', 'state:loading'],
          entry: 'sendToLoading',
          invoke: {
            id: 'attemptPhoneNumberVerification',
            src: 'attempt',
            input: ({ context }) => ({
              parent: context.parent,
              params: {
                strategy: 'phone_code',
                code: (context.formRef.getSnapshot().context.fields.get('code')?.value as string) || '',
              },
            }),
            onDone: {
              actions: [raise(({ event }) => ({ type: 'NEXT', resource: event.output })), 'sendToLoading'],
            },
            onError: {
              actions: ['setFormErrors', 'sendToLoading'],
              target: 'Pending',
            },
          },
        },
      },
    },
  },
});
