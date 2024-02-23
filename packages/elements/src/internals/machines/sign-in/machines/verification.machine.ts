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
import type { ActorRefFrom } from 'xstate';
import { assign, fromPromise, sendParent, sendTo, setup } from 'xstate';

import { ClerkElementsError, ClerkElementsRuntimeError } from '~/internals/errors';
import type { FormFields } from '~/internals/machines/form/form.types';
import type { WithParams } from '~/internals/machines/shared.types';
import type { SignInRouterMachine } from '~/internals/machines/sign-in/machines/router.machine';
import type { SignInVerificationSchema } from '~/internals/machines/sign-in/types';
import { determineStartingSignInFactor, determineStartingSignInSecondFactor } from '~/internals/machines/sign-in/utils';
import { assertActorEventError, assertIsDefined } from '~/internals/machines/utils/assert';

export type TSignInFirstFactorMachine = typeof SignInFirstFactorMachine;
export type TSignInSecondFactorMachine = typeof SignInSecondFactorMachine;

type Parent = ActorRefFrom<typeof SignInRouterMachine>;

export type PrepareFirstFactorInput = WithParams<PrepareFirstFactorParams | null> & {
  parent: Parent;
  strategy?: SignInStrategy;
};
export type PrepareSecondFactorInput = WithParams<PrepareSecondFactorParams | null> & {
  parent: Parent;
  strategy?: SignInStrategy;
};

export type AttemptFirstFactorInput = { parent: Parent; fields: FormFields; currentFactor: SignInFirstFactor | null };
export type AttemptSecondFactorInput = { parent: Parent; fields: FormFields; currentFactor: SignInSecondFactor | null };

export const SignInVerificationMachineId = 'SignInVerification';

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
      throw new ClerkElementsRuntimeError('Action `determineStartingFactor` must be overridden');
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
  types: {} as SignInVerificationSchema,
}).createMachine({
  id: SignInVerificationMachineId,
  context: ({ input }) => ({
    currentFactor: null,
    formRef: input.form,
    parent: input.parent,
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
            parent: context.parent,
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
          parent: context.parent,
          currentFactor: context.currentFactor as SignInFirstFactor,
          fields: context.formRef.getSnapshot().context.fields,
        }),
        onDone: {
          actions: sendParent(({ event }) => ({ type: 'NEXT', resource: event.output })),
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
      console.log('prepare', input);
      const { params, parent, strategy } = input as PrepareFirstFactorInput;
      const clerk = parent.getSnapshot().context.clerk;

      if (strategy === 'password') {
        return Promise.resolve(clerk.client.signIn);
      }

      if (!params) {
        // enUS.signIn.noAvailableMethods
        throw new ClerkElementsError(
          'noAvailableMethods',
          "Cannot proceed with sign in. There's no available authentication factor.",
        );
      }

      return clerk.client.signIn.prepareFirstFactor(params);
    }),
    attempt: fromPromise(async ({ input }) => {
      console.log('attempt', input);
      const { currentFactor, fields, parent } = input as AttemptFirstFactorInput;

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

      return parent.getSnapshot().context.clerk.client.signIn.attemptFirstFactor(attemptParams);
    }),
  },
  actions: {
    determineStartingFactor: assign({
      currentFactor: ({ context }) => {
        const clerk = context.parent.getSnapshot().context.clerk;

        return determineStartingSignInFactor(
          clerk.client.signIn.supportedFirstFactors,
          clerk.client.signIn.identifier,
          clerk.__unstable__environment?.displayConfig.preferredSignInStrategy,
        );
      },
    }),
  },
});

export const SignInSecondFactorMachine = SignInVerificationMachine.provide({
  actors: {
    prepare: fromPromise(({ input }) => {
      const { params, parent, strategy } = input as PrepareSecondFactorInput;
      const clerk = parent.getSnapshot().context.clerk;

      if (strategy === 'totp') {
        return Promise.resolve(clerk.client.signIn);
      }

      assertIsDefined(params);

      return clerk.client.signIn.prepareSecondFactor({
        strategy: params.strategy,
        phoneNumberId: params.phoneNumberId,
      });
    }),
    attempt: fromPromise(async ({ input }) => {
      const { fields, parent, currentFactor } = input as AttemptSecondFactorInput;

      const code = fields.get('code')?.value as string;

      assertIsDefined(currentFactor);
      assertIsDefined(code);

      return parent.getSnapshot().context.clerk.client.signIn.attemptSecondFactor({
        strategy: currentFactor.strategy,
        code,
      });
    }),
  },
  actions: {
    determineStartingFactor: assign({
      currentFactor: ({ context }) =>
        determineStartingSignInSecondFactor(
          context.parent.getSnapshot().context.clerk.client.signIn.supportedSecondFactors,
        ),
    }),
  },
});
