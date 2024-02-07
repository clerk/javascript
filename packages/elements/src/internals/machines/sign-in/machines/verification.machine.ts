import type {
  AttemptFirstFactorParams,
  EmailCodeAttempt,
  PasswordAttempt,
  PhoneCodeAttempt,
  PrepareFirstFactorParams,
  PrepareSecondFactorParams,
  ResetPasswordEmailCodeAttempt,
  ResetPasswordPhoneCodeAttempt,
  SignInFirstFactor,
  SignInResource,
  SignInSecondFactor,
  SignInStrategy,
  Web3Attempt,
} from '@clerk/types';
import { assign, fromPromise, sendTo, setup } from 'xstate';

import { ClerkElementsRuntimeError } from '~/internals/errors/error';
import type { FormFields } from '~/internals/machines/form/form.types';
import type { WithClient, WithParams } from '~/internals/machines/shared.types';
import type { SignInVerificationSchema } from '~/internals/machines/sign-in/types';
import { determineStartingSignInFactor, determineStartingSignInSecondFactor } from '~/internals/machines/sign-in/utils';
import { assertActorEventError, assertIsDefined } from '~/internals/machines/utils/assert';

export type TSignInFirstFactorMachine = typeof SignInFirstFactorMachine;
export type TSignInSecondFactorMachine = typeof SignInSecondFactorMachine;

export type PrepareFirstFactorInput = WithClient<
  WithParams<PrepareFirstFactorParams | null> & { strategy?: SignInStrategy }
>;
export type PrepareSecondFactorInput = WithClient<
  WithParams<PrepareSecondFactorParams | null> & { strategy?: SignInStrategy }
>;

export type AttemptFirstFactorInput = WithClient<{ fields: FormFields; currentFactor: SignInFirstFactor | null }>;
export type AttemptSecondFactorInput = WithClient<{ fields: FormFields; currentFactor: SignInSecondFactor | null }>;

export const SignInVerificationMachineId = 'SignInVerification';
export const SignInFirstFactorMachineId = 'SignInFirstFactor';
export const SignInSecondFactorMachineId = 'SignInSecondFactor';

const SignInVerificationMachine = setup({
  actors: {
    prepare: fromPromise<SignInResource, PrepareFirstFactorInput | PrepareSecondFactorInput>(() =>
      Promise.reject(new ClerkElementsRuntimeError('Actor `prepare` must be overridden')),
    ),
    attempt: fromPromise<SignInResource, AttemptFirstFactorInput | AttemptSecondFactorInput>(() =>
      Promise.reject(new ClerkElementsRuntimeError('Actor `attempt` must be overridden')),
    ),
  },
  actions: {
    determineStartingFactor: () => {
      throw new ClerkElementsRuntimeError('Action `determineStartingFactor` be overridden');
    },
    goToNextState: sendTo(
      ({ context }) => context.routerRef,
      (_, { resource }: { resource: SignInResource }) => ({
        type: 'NEXT',
        resource,
      }),
    ),
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
  types: {} as SignInVerificationSchema,
}).createMachine({
  id: SignInVerificationMachineId,
  context: ({ input }) => ({
    currentFactor: null,
    clerk: input.clerk,
    formRef: input.form,
    routerRef: input.router,
  }),
  initial: 'Preparing',
  entry: 'determineStartingFactor',
  states: {
    Preparing: {
      tags: ['state:preparing', 'state:loading'],
      invoke: {
        id: 'prepare',
        src: 'prepare',
        input: ({ context }) => {
          return {
            client: context.clerk.client,
            params: context.currentFactor as PrepareFirstFactorParams,
            strategy: context.currentFactor?.strategy,
          };
        },
        onDone: 'Pending',
        onError: {
          actions: 'setFormErrors',
          target: 'Pending',
        },
      },
    },
    Pending: {
      tags: ['state:pending'],
      description: 'Waiting for user input',
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
        id: 'attempt',
        src: 'attempt',
        input: ({ context }) => ({
          client: context.clerk.client,
          currentFactor: context.currentFactor as SignInFirstFactor,
          fields: context.formRef.getSnapshot().context.fields,
        }),
        onDone: {
          actions: { type: 'goToNextState', params: ({ event }) => ({ resource: event.output }) },
        },
        onError: {
          actions: 'setFormErrors',
          target: 'Pending',
        },
      },
    },
  },
});

export const SignInFirstFactorMachine = SignInVerificationMachine.provide({
  actors: {
    prepare: fromPromise(async ({ input }) => {
      const { client, params, strategy } = input as PrepareFirstFactorInput;

      if (strategy === 'password') {
        return Promise.resolve(client.signIn);
      }

      if (!params) {
        throw new ClerkElementsRuntimeError('prepareFirstFactor parameters were undefined');
      }

      return client.signIn.prepareFirstFactor(params);
    }),
    attempt: fromPromise(async ({ input }) => {
      const { client, fields, currentFactor } = input as AttemptFirstFactorInput;

      assertIsDefined(currentFactor);

      let attemptParams: AttemptFirstFactorParams;

      const strategy = currentFactor.strategy;
      const code = fields.get('code')?.value as string | undefined;
      const password = fields.get('password')?.value as string | undefined;

      switch (strategy) {
        case 'password': {
          assertIsDefined(password);

          attemptParams = {
            strategy,
            password,
          } satisfies PasswordAttempt;

          break;
        }
        case 'reset_password_phone_code':
        case 'reset_password_email_code': {
          assertIsDefined(code);
          assertIsDefined(password);

          attemptParams = {
            strategy,
            code,
            password,
          } satisfies ResetPasswordPhoneCodeAttempt | ResetPasswordEmailCodeAttempt;

          break;
        }
        case 'phone_code':
        case 'email_code': {
          assertIsDefined(code);

          attemptParams = {
            strategy,
            code,
          } satisfies PhoneCodeAttempt | EmailCodeAttempt;

          break;
        }
        case 'web3_metamask_signature': {
          const signature = fields.get('signature')?.value as string | undefined;
          assertIsDefined(signature);

          attemptParams = {
            strategy,
            signature,
          } satisfies Web3Attempt;

          break;
        }
        default:
          throw new ClerkElementsRuntimeError(`Invalid strategy: ${strategy}`);
      }

      return client.signIn.attemptFirstFactor(attemptParams);
    }),
  },
  actions: {
    determineStartingFactor: assign({
      currentFactor: ({ context }) =>
        determineStartingSignInFactor(
          context.clerk.client.signIn.supportedFirstFactors,
          context.clerk.client.signIn.identifier,
          context.clerk.__unstable__environment?.displayConfig.preferredSignInStrategy,
        ),
    }),
  },
});

export const SignInSecondFactorMachine = SignInVerificationMachine.provide({
  actors: {
    prepare: fromPromise(({ input }) => {
      const { client, params, strategy } = input as PrepareSecondFactorInput;

      if (strategy === 'totp') {
        return Promise.resolve(client.signIn);
      }

      assertIsDefined(params);
      return client.signIn.prepareSecondFactor(params);
    }),
    attempt: fromPromise(async ({ input }) => {
      const { client, fields, currentFactor } = input as AttemptSecondFactorInput;

      const code = fields.get('code')?.value as string;

      assertIsDefined(currentFactor);
      assertIsDefined(code);

      return client.signIn.attemptSecondFactor({
        strategy: currentFactor.strategy,
        code,
      });
    }),
  },
  actions: {
    determineStartingFactor: assign({
      currentFactor: ({ context }) =>
        determineStartingSignInSecondFactor(context.clerk.client.signIn.supportedSecondFactors),
    }),
  },
});
