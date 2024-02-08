import type {
  AttemptVerificationParams,
  Attribute,
  PrepareVerificationParams,
  SignUpResource,
  SignUpVerifiableField,
  SignUpVerificationsResource,
  VerificationStatus,
  VerificationStrategy,
} from '@clerk/types';
import type { Writable } from 'type-fest';
import { and, enqueueActions, fromPromise, log, raise, sendTo, setup } from 'xstate';

import { SIGN_UP_DEFAULT_BASE_PATH } from '~/internals/constants';
import { ClerkElementsError } from '~/internals/errors/error';
import { startSignUpEmailLinkFlow } from '~/internals/machines/sign-up/sign-up.actors'; // TODO: Move source actors
import type {
  SignUpVerificationContext,
  SignUpVerificationEvents,
  SignUpVerificationSchema,
} from '~/internals/machines/sign-up/types';
import { assertActorEventError } from '~/internals/machines/utils/assert';

import type { WithClerk, WithParams } from '../../shared.types';

export type SignUpVerificationsResourceKey = keyof SignUpVerificationsResource;
export type TSignUpVerificationMachine = typeof SignUpVerificationMachine;

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

export type PrepareVerificationInput = WithClerk<
  WithParams<PrepareVerificationParams> & { skipIfVerified: keyof SignUpVerificationsResource }
>;
export type AttemptVerificationInput = WithClerk<WithParams<AttemptVerificationParams>>;

export const SignUpVerificationMachine = setup({
  actors: {
    prepare: fromPromise<SignUpResource, PrepareVerificationInput>(
      ({ input: { clerk, params, skipIfVerified: skipKey } }) => {
        console.log('Preparing', skipKey);
        if (!clerk.client.signUp.status || clerk.client.signUp.verifications[skipKey].status === 'verified') {
          return Promise.resolve(clerk.client.signUp);
        }
        return clerk.client.signUp.prepareVerification(params);
      },
    ),
    attempt: fromPromise<SignUpResource, AttemptVerificationInput>(({ input: { clerk, params } }) =>
      clerk.client.signUp.attemptVerification(params),
    ),
    startSignUpEmailLinkFlow,
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
    hasVerificationStatus: (
      { context },
      params: { strategy: SignUpVerificationsResourceKey; status: VerificationStatus },
    ) => context.clerk.client.signUp.verifications[params.strategy].status === params.status,
    isFieldUnverified: ({ context }, { field }: { field: SignUpVerifiableField }) =>
      context.clerk.client.signUp.unverifiedFields.includes(field),
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
    formRef: input.form,
    routerRef: input.router,
  }),
  on: {
    NEXT: [
      {
        description: 'Validate via phone number',
        actions: log('NEXT 1'),
        guard: 'shouldVerifyPhoneCode',
        target: '.PhoneCode',
      },
      {
        description: 'Validate via email link',
        actions: log('NEXT 2'),
        guard: 'shouldVerifyEmailLink',
        target: '.EmailLink',
      },
      {
        description: 'Verify via email code',
        actions: log('NEXT 3'),
        guard: 'shouldVerifyEmailCode',
        target: '.EmailCode',
      },
      // {
      //   guard: and([not('shouldVerifyPhoneCode'), not('shouldVerifyEmailLink'), not('shouldVerifyEmailCode')]),
      //   actions: sendParent({ type: 'NEXT' }),
      // },
    ],
  },
  states: {
    Init: {
      always: [
        {
          description: 'Validate via phone number',
          actions: log('ALWAYS 1'),
          guard: 'shouldVerifyPhoneCode',
          target: 'PhoneCode',
        },
        {
          description: 'Validate via email link',
          actions: log('ALWAYS 2'),
          guard: 'shouldVerifyEmailLink',
          target: 'EmailLink',
        },
        {
          description: 'Verify via email code',
          actions: log('ALWAYS 3'),
          guard: 'shouldVerifyEmailCode',
          target: 'EmailCode',
        },
        // {
        //   actions: sendParent({ type: 'NEXT' }),
        // },
      ],
    },
    EmailLink: {
      tags: ['verification:method:email', 'verification:category:link', 'verification:email_link'],
      initial: 'Preparing',
      on: {
        'EMAIL_LINK.RESTART': {
          actions: sendTo('signUpEmailLinkFlow', { type: 'STOP' }),
          target: '.Attempting',
          reenter: true,
        },
        'EMAIL_LINK.*': {
          actions: enqueueActions(({ context, enqueue, event }) => {
            console.debug('EMAIL_LINK.*', event);

            if (event.type === 'EMAIL_LINK.FAILURE') {
              enqueue.sendTo(context.formRef, { type: 'ERRORS.SET', error: event.error });
              enqueue.raise({ type: 'NEXT' });
            } else if (event.type !== 'EMAIL_LINK.RESTART') {
              enqueue.raise({ type: 'NEXT', resource: event.resource });
            }
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
              skipIfVerified: 'emailAddress',
            }),
            onDone: 'Attempting',
          },
        },
        Attempting: {
          tags: ['state:attempting'],
          invoke: {
            id: 'signUpEmailLinkVerificationFlow',
            src: 'startSignUpEmailLinkFlow',
            input: ({ context }) => ({
              clerk: context.clerk,
            }),
          },
          after: {
            // TODO: Use named delays
            300_000: {
              description: 'Timeout after 5 minutes',
              actions: raise({
                type: 'EMAIL_LINK.FAILURE',
                error: new ClerkElementsError('verify-email-link-timeout', 'Timeout'),
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
              skipIfVerified: 'emailAddress',
            }),
            onDone: 'Pending',
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
      initial: 'Pending',
      states: {
        Preparing: {
          tags: ['state:preparing', 'state:loading'],
          entry: log('PhoneCode:Preparing'),
          invoke: {
            id: 'preparePhoneCodeVerification',
            src: 'prepare',
            input: ({ context }) => ({
              clerk: context.clerk,
              params: {
                strategy: 'phone_code',
              },
              skipIfVerified: 'phoneNumber',
            }),
            onDone: 'Pending',
            onError: {
              actions: 'setFormErrors',
              target: 'Pending',
            },
          },
        },
        Pending: {
          tags: ['state:pending'],
          entry: log('PhoneCode:Pending'),
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
              actions: raise({ type: 'NEXT' }),
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
