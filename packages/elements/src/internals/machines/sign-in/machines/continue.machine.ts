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
import { assign, fromPromise, log, sendTo, setup } from 'xstate';

import { ClerkElementsRuntimeError } from '~/internals/errors/error';
import type { SignInContinueSchema } from '~/internals/machines/sign-in/types';
import { assertActorEventError, assertIsDefined } from '~/internals/machines/utils/assert';

import type { FormFields } from '../../form/form.types';
import type { WithClient, WithParams } from '../../shared.types';
import { determineStartingSignInFactor, determineStartingSignInSecondFactor } from '../sign-in.utils';

export type ResourceResponse = SignInResource | void;

export type PrepareFirstFactorInput = WithClient<
  WithParams<PrepareFirstFactorParams | null> & { strategy?: SignInStrategy }
>;
export type PrepareSecondFactorInput = WithClient<
  WithParams<PrepareSecondFactorParams | null> & { strategy?: SignInStrategy }
>;

export type AttemptFirstFactorInput = WithClient<
  WithParams<{ fields: FormFields; currentFactor: SignInFirstFactor | null }>
>;

export type AttemptSecondFactorInput = WithClient<
  WithParams<{ fields: FormFields; currentFactor: SignInSecondFactor | null }>
>;

export const SignInContinueMachineId = 'SignInContinue';
export const SignInFirstFactorMachineId = 'SignInFirstFactor';
export const SignInSecondFactorMachineId = 'SignInSecondFactor';

export type TSignInContinueMachine = typeof SignInContinueMachine;
export type TSignInFirstFactorMachine = ReturnType<typeof createFirstFactorMachine>;
export type TSignInSecondFactorMachine = ReturnType<typeof createSecondFactorMachine>;

export const SignInContinueMachine = setup({
  actors: {
    prepare: fromPromise<ResourceResponse, PrepareFirstFactorInput | PrepareSecondFactorInput>(() => Promise.reject()),
    attempt: fromPromise<ResourceResponse, AttemptFirstFactorInput | AttemptSecondFactorInput>(() => Promise.reject()),
  },
  actions: {
    determineStartingFactor: assign({ currentFactor: undefined }),
    goToNextState: sendTo(({ context }) => context.routerRef, { type: 'NEXT' }),
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
  types: {} as SignInContinueSchema,
}).createMachine({
  id: SignInContinueMachineId,
  context: ({ input }) => ({
    currentFactor: null,
    clerk: input.clerk,
    formRef: input.form,
    routerRef: input.router,
  }),
  initial: 'Pending',
  entry: 'determineStartingFactor',
  states: {
    Preparing: {
      tags: ['state:preparing', 'state:loading'],
      invoke: {
        id: 'prepare',
        src: 'prepare',
        input: ({ context }) => ({
          client: context.clerk.client,
          params: context.currentFactor, // TODO: Appropriately type
          strategy: context.currentFactor?.strategy,
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
      entry: log(({ context }) => context.clerk.client.signIn),
      invoke: {
        id: 'attempt',
        src: 'attempt',
        input: ({ context }) => ({
          client: context.clerk.client,
          params: {
            currentFactor: context.currentFactor, // TODO: Appropriately type
            fields: context.formRef.getSnapshot().context.fields,
          },
        }),
        // onDone: {
        //   actions: [log(({ context }) => context.clerk.client.signIn), 'goToNextState'],
        // },
        onDone: 'Done',
        onError: {
          actions: 'setFormErrors',
          target: 'Pending',
        },
      },
    },
    Done: {
      type: 'final',
      entry: [log('TEST'), log(({ context }) => context.clerk.client.signIn), 'goToNextState'],
    },
  },
});

export function createFirstFactorMachine() {
  return SignInContinueMachine.provide({
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
        const {
          client,
          params: { fields, currentFactor },
        } = input as AttemptFirstFactorInput;

        console.log('input', input);

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
}

export function createSecondFactorMachine() {
  return SignInContinueMachine.provide({
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
        const {
          client,
          params: { fields, currentFactor },
        } = input as AttemptSecondFactorInput;

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
}
