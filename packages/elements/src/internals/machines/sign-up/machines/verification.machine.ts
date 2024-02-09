import { Poller } from '@clerk/shared';
import type {
  AttemptVerificationParams,
  Attribute,
  PrepareVerificationParams,
  SignUpResource,
  SignUpVerifiableField,
  SignUpVerificationsResource,
  VerificationStrategy,
} from '@clerk/types';
import type { Writable } from 'type-fest';
import { and, assign, enqueueActions, fromCallback, fromPromise, raise, sendParent, sendTo, setup } from 'xstate';

import { SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import { ClerkElementsError, ClerkElementsRuntimeError } from '~/internals/errors/error';
import type {
  SignUpVerificationContext,
  SignUpVerificationEvents,
  SignUpVerificationSchema,
} from '~/internals/machines/sign-up/types';
import { assertActorEventError } from '~/internals/machines/utils/assert';

import type { WithClerk, WithParams } from '../../shared.types';

export type SignUpVerificationsResourceKey = keyof SignUpVerificationsResource;
export type TSignUpVerificationMachine = typeof SignUpVerificationMachine;

export type StartSignUpEmailLinkFlowEvents = { type: 'STOP' };
export type StartSignUpEmailLinkFlowInput = WithClerk;

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

export type PrepareVerificationInput = WithClerk<WithParams<PrepareVerificationParams>>;
export type AttemptVerificationInput = WithClerk<WithParams<AttemptVerificationParams>>;

export const SignUpVerificationMachine = setup({
  actors: {
    prepare: fromPromise<SignUpResource, PrepareVerificationInput>(({ input: { clerk, params } }) =>
      clerk.client.signUp.prepareVerification(params),
    ),
    attempt: fromPromise<SignUpResource, AttemptVerificationInput>(({ input: { clerk, params } }) =>
      clerk.client.signUp.attemptVerification(params),
    ),
    attemptEmailLinkVerification: fromCallback<StartSignUpEmailLinkFlowEvents, StartSignUpEmailLinkFlowInput>(
      ({ receive, sendBack, input: { clerk } }) => {
        const { run, stop } = Poller();

        void run(async () =>
          clerk.client.signUp
            .reload()
            .then(resource => {
              const signInStatus = resource.status;
              const verificationStatus = resource.verifications.emailAddress.status;

              // Short-circuit if the sign-up resource is already complete
              if (signInStatus === 'complete') {
                return sendBack({ type: `EMAIL_LINK.VERIFIED`, resource });
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
                    type: `EMAIL_LINK.FAILED`,
                    error: new ClerkElementsError('email-link-verification-failed', 'Email verification failed'),
                    resource,
                  });
                  break;
                }
                case 'unverified':
                default:
                  return;
              }

              stop();
            })
            .catch(error => {
              stop();
              new ClerkElementsRuntimeError(error);
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
    isStrategyEnabled: (
      { context },
      { attribute, strategy }: { attribute: Attribute; strategy: VerificationStrategy },
    ) =>
      Boolean(
        context.clerk.__unstable__environment?.userSettings.attributes[attribute].verifications.includes(strategy),
      ),
    shouldVerifyPhoneCode: shouldVerify('phone_number'),
    shouldVerifyEmailLink: shouldVerify('email_address', 'email_link'),
    shouldVerifyEmailCode: shouldVerify('email_address', 'email_code'),
  },
  types: {} as SignUpVerificationSchema,
}).createMachine({
  id: SignUpVerificationMachineId,
  initial: 'Init',
  context: ({ input }) => ({
    basePath: input.basePath || SIGN_UP_DEFAULT_BASE_PATH,
    clerk: input.clerk,
    resource: input.clerk.client.signUp,
    formRef: input.form,
    routerRef: input.router,
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
        'EMAIL_LINK.RESTART': {
          target: '.Attempting',
          reenter: true,
        },
        'EMAIL_LINK.FAILED': {
          actions: [
            { type: 'setFormErrors', params: ({ event }) => ({ error: event.error }) },
            assign({ resource: ({ event }) => event.resource }),
          ],
          target: '.Pending',
        },
        'EMAIL_LINK.*': {
          actions: enqueueActions(({ enqueue, event }) => {
            if (event.type === 'EMAIL_LINK.RESTART') return;

            enqueue.assign({ resource: event.resource });
            enqueue.raise({ type: 'NEXT', resource: event.resource });
          }),
        },
      },
      states: {
        Preparing: {
          tags: ['state:preparing', 'state:loading'],
          invoke: {
            id: 'prepareEmailLinkVerification',
            src: 'prepare',
            input: ({ context }) => ({
              clerk: context.clerk,
              params: {
                strategy: 'email_link',
                redirectUrl: context.clerk.buildAfterSignUpUrl(),
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
            NEXT: {
              target: 'Preparing',
              reenter: true,
            },
          },
        },
        Attempting: {
          tags: ['state:attempting'],
          invoke: {
            id: 'attemptEmailLinkVerification',
            src: 'attemptEmailLinkVerification',
            input: ({ context }) => ({
              clerk: context.clerk,
            }),
          },
          after: {
            // TODO: Use named delays
            300_000: {
              description: 'Timeout after 5 minutes',
              target: 'Pending',
              actions: sendTo(({ context }) => context.formRef, {
                type: 'ERRORS.SET',
                error: new ClerkElementsError('verify-email-link-timeout', 'Email link verification timed out'),
              }),
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
          invoke: {
            id: 'prepareEmailAddressCodeVerification',
            src: 'prepare',
            input: ({ context }) => ({
              clerk: context.clerk,
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
          },
        },
        Pending: {
          tags: ['state:pending'],
          on: {
            SUBMIT: {
              target: 'Attempting',
              reenter: true,
            },
          },
        },
        Attempting: {
          tags: ['state:attempting', 'state:loading'],
          invoke: {
            id: 'attemptEmailAddressCodeVerification',
            src: 'attempt',
            input: ({ context }) => ({
              clerk: context.clerk,
              params: {
                strategy: 'email_code',
                code: (context.formRef.getSnapshot().context.fields.get('code')?.value as string) || '',
              },
            }),
            onDone: {
              actions: raise(({ event }) => ({ type: 'NEXT', resource: event.output })),
            },
            onError: {
              actions: 'setFormErrors',
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
          invoke: {
            id: 'preparePhoneCodeVerification',
            src: 'prepare',
            input: ({ context }) => ({
              clerk: context.clerk,
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
            SUBMIT: {
              target: 'Attempting',
              reenter: true,
            },
          },
        },
        Attempting: {
          tags: ['state:attempting', 'state:loading'],
          invoke: {
            id: 'attemptPhoneNumberVerification',
            src: 'attempt',
            input: ({ context }) => ({
              clerk: context.clerk,
              params: {
                strategy: 'phone_code',
                code: (context.formRef.getSnapshot().context.fields.get('code')?.value as string) || '',
              },
            }),
            onDone: {
              actions: raise(({ event }) => ({ type: 'NEXT', resource: event.output })),
            },
            onError: {
              actions: 'setFormErrors',
              target: 'Pending',
            },
          },
        },
      },
    },
  },
});
