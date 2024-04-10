import type {
  AttemptFirstFactorParams,
  EmailCodeAttempt,
  PasswordAttempt,
  PhoneCodeAttempt,
  PrepareFirstFactorParams,
  ResetPasswordEmailCodeAttempt,
  ResetPasswordPhoneCodeAttempt,
  SignInFactor,
  SignInFirstFactor,
  SignInResource,
  SignInSecondFactor,
  Web3Attempt,
} from '@clerk/types';
import type { ActorRefFrom, DoneActorEvent } from 'xstate';
import { assign, fromPromise, sendTo, setup } from 'xstate';

import { ClerkElementsRuntimeError } from '~/internals/errors';
import type { FormFields } from '~/internals/machines/form/form.types';
import { sendToLoading } from '~/internals/machines/shared.actions';
import type { WithParams } from '~/internals/machines/shared.types';
import type { SignInRouterMachine } from '~/internals/machines/sign-in/machines/router.machine';
import type { SignInVerificationSchema } from '~/internals/machines/sign-in/types';
import { determineStartingSignInFactor, determineStartingSignInSecondFactor } from '~/internals/machines/sign-in/utils';
import { assertActorEventError, assertIsDefined } from '~/internals/machines/utils/assert';

export type TSignInFirstFactorMachine = typeof SignInFirstFactorMachine;
export type TSignInSecondFactorMachine = typeof SignInSecondFactorMachine;

type Parent = ActorRefFrom<typeof SignInRouterMachine>;

export type PrepareFirstFactorInput = WithParams<SignInFirstFactor | null> & {
  parent: Parent;
};
export type PrepareSecondFactorInput = WithParams<SignInSecondFactor | null> & {
  parent: Parent;
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
    handleMissingStrategy: ({ context }) => {
      console.log(context);
      const clerk = context.parent.getSnapshot().context.clerk;
      if (
        clerk.__unstable__environment?.isProduction() ||
        !context.registeredStrategies.has(context.currentFactor?.strategy as unknown as SignInFactor)
      ) {
        return;
      }

      const msg = `Your current step is rendering strategies: ${[...context.registeredStrategies]
        .map(s => s)
        .join(', ')}, but is currently missing: <Strategy name="${
        context.currentFactor?.strategy
      }">. Before deploying your app, make sure to render a <Strategy name="${
        context.currentFactor?.strategy
      }"> component.`;

      if (process.env.NODE_ENV === 'development') {
        console.warn(msg);
      } else {
        throw new ClerkElementsRuntimeError(msg);
      }
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
    sendToNext: ({ context, event }) =>
      context.parent.send({ type: 'NEXT', resource: (event as unknown as DoneActorEvent<SignInResource>).output }),
    sendToLoading,
  },
  types: {} as SignInVerificationSchema,
}).createMachine({
  id: SignInVerificationMachineId,
  context: ({ input }) => ({
    currentFactor: null,
    formRef: input.form,
    parent: input.parent,
    loadingStep: 'verifications',
    registeredStrategies: new Set<SignInFactor>(),
  }),
  initial: 'Preparing',
  entry: 'determineStartingFactor',
  on: {
    'STRATEGY.REGISTER': {
      actions: assign({
        registeredStrategies: ({ context, event }) => context.registeredStrategies.add(event.factor),
      }),
    },
    'STRATEGY.UNREGISTER': {
      actions: assign({
        registeredStrategies: ({ context, event }) => {
          context.registeredStrategies.delete(event.factor);
          return context.registeredStrategies;
        },
      }),
    },
  },
  states: {
    Preparing: {
      tags: ['state:preparing', 'state:loading'],
      invoke: {
        id: 'prepare',
        src: 'prepare',
        input: ({ context }) => ({
          parent: context.parent,
          params: context.currentFactor as SignInFirstFactor | null,
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
        'NAVIGATE.CHOOSE_STRATEGY': 'ChooseStrategy',
        SUBMIT: {
          target: 'Attempting',
          reenter: true,
        },
      },
      after: {
        3000: {
          actions: 'handleMissingStrategy',
        },
      },
    },
    ChooseStrategy: {
      tags: ['state:choose-strategy'],
      on: {
        'STRATEGY.UPDATE': {
          actions: assign({ currentFactor: ({ event }) => event.factor || null }),
          target: 'Preparing',
        },
      },
    },
    Attempting: {
      tags: ['state:attempting', 'state:loading'],
      entry: 'sendToLoading',
      invoke: {
        id: 'attempt',
        src: 'attempt',
        input: ({ context }) => ({
          parent: context.parent,
          currentFactor: context.currentFactor as SignInFirstFactor,
          fields: context.formRef.getSnapshot().context.fields,
        }),
        onDone: {
          actions: ['sendToNext', 'sendToLoading'],
        },
        onError: {
          actions: ['setFormErrors', 'sendToLoading'],
          target: 'Pending',
        },
      },
    },
  },
});

export const SignInFirstFactorMachine = SignInVerificationMachine.provide({
  actors: {
    prepare: fromPromise(async ({ input }) => {
      const { params, parent } = input;
      const clerk = parent.getSnapshot().context.clerk;

      if (!params?.strategy || params.strategy === 'password') {
        return Promise.resolve(clerk.client.signIn);
      }

      assertIsDefined(params);

      return clerk.client.signIn.prepareFirstFactor(params as PrepareFirstFactorParams);
    }),
    attempt: fromPromise(async ({ input }) => {
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
      const { params, parent } = input;
      const clerk = parent.getSnapshot().context.clerk;

      assertIsDefined(params);

      if (params.strategy !== 'phone_code') {
        return Promise.resolve(clerk.client.signIn);
      }

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
