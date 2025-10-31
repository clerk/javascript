import { isClerkAPIResponseError } from '@clerk/shared/error';
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
  Web3Attempt,
} from '@clerk/shared/types';
import type { DoneActorEvent } from 'xstate';
import { assign, fromPromise, log, sendTo, setup } from 'xstate';

import {
  MAGIC_LINK_VERIFY_PATH_ROUTE,
  RESENDABLE_COUNTDOWN_DEFAULT,
  SIGN_IN_DEFAULT_BASE_PATH,
} from '~/internals/constants';
import { ClerkElementsRuntimeError } from '~/internals/errors';
import type { FormFields } from '~/internals/machines/form';
import type { SignInStrategyName, WithParams } from '~/internals/machines/shared';
import { sendToLoading } from '~/internals/machines/shared';
import { determineStartingSignInFactor, determineStartingSignInSecondFactor } from '~/internals/machines/sign-in/utils';
import { assertActorEventError, assertIsDefined } from '~/internals/machines/utils/assert';

import type { SignInRouterMachineActorRef } from './router.types';
import type { SignInVerificationSchema } from './verification.types';
import { SignInVerificationDelays } from './verification.types';

export type TSignInFirstFactorMachine = typeof SignInFirstFactorMachine;
export type TSignInSecondFactorMachine = typeof SignInSecondFactorMachine;

export type DetermineStartingFactorInput = {
  parent: SignInRouterMachineActorRef;
};

export type PrepareFirstFactorInput = WithParams<PrepareFirstFactorParams> & {
  parent: SignInRouterMachineActorRef;
  resendable: boolean;
};
export type PrepareSecondFactorInput = WithParams<PrepareSecondFactorParams> & {
  parent: SignInRouterMachineActorRef;
  resendable: boolean;
};

export type AttemptFirstFactorInput = {
  parent: SignInRouterMachineActorRef;
  fields: FormFields;
  currentFactor: SignInFirstFactor | null;
};
export type AttemptSecondFactorInput = {
  parent: SignInRouterMachineActorRef;
  fields: FormFields;
  currentFactor: SignInSecondFactor | null;
};

const isNonPreparableStrategy = (strategy?: SignInFirstFactor['strategy'] | SignInSecondFactor['strategy']) => {
  if (!strategy) {
    return false;
  }

  return ['passkey', 'password'].includes(strategy);
};

export const SignInVerificationMachineId = 'SignInVerification';

const SignInVerificationMachine = setup({
  actors: {
    determineStartingFactor: fromPromise<SignInFirstFactor | SignInSecondFactor | null, DetermineStartingFactorInput>(
      () => Promise.reject(new ClerkElementsRuntimeError('Actor `determineStartingFactor` must be overridden')),
    ),
    prepare: fromPromise<SignInResource, PrepareFirstFactorInput | PrepareSecondFactorInput>(() =>
      Promise.reject(new ClerkElementsRuntimeError('Actor `prepare` must be overridden')),
    ),
    attempt: fromPromise<SignInResource, AttemptFirstFactorInput | AttemptSecondFactorInput>(() =>
      Promise.reject(new ClerkElementsRuntimeError('Actor `attempt` must be overridden')),
    ),
    attemptPasskey: fromPromise<
      SignInResource,
      { parent: SignInRouterMachineActorRef; flow: 'autofill' | 'discoverable' | undefined }
    >(({ input: { parent, flow } }) => {
      return parent.getSnapshot().context.clerk.client.signIn.authenticateWithPasskey({
        flow,
      });
    }),
  },
  actions: {
    resendableTick: assign(({ context }) => ({
      resendable: context.resendableAfter === 0,
      resendableAfter: context.resendableAfter > 0 ? context.resendableAfter - 1 : context.resendableAfter,
    })),
    resendableReset: assign({
      resendable: false,
      resendableAfter: RESENDABLE_COUNTDOWN_DEFAULT,
    }),
    validateRegisteredStrategies: ({ context }) => {
      const clerk = context.parent.getSnapshot().context.clerk;

      if (clerk.__unstable__environment?.isProduction()) {
        return;
      }

      // Only show these warnings in development!
      if (process.env.NODE_ENV === 'development') {
        if (
          clerk.client.signIn.supportedFirstFactors &&
          !clerk.client.signIn.supportedFirstFactors.every((factor: SignInFirstFactor) =>
            context.registeredStrategies.has(factor.strategy),
          )
        ) {
          console.warn(
            `Clerk: Your instance is configured to support these strategies: ${clerk.client.signIn.supportedFirstFactors
              .map((factor: SignInFirstFactor) => factor.strategy)
              .join(', ')}, but the rendered strategies are: ${Array.from(context.registeredStrategies).join(
              ', ',
            )}. Make sure to render a <Strategy> component for each supported strategy. More information: https://clerk.com/docs/elements/reference/sign-in#strategy`,
          );
        }

        if (
          clerk.client.signIn.supportedSecondFactors &&
          !clerk.client.signIn.supportedSecondFactors.every((factor: SignInSecondFactor) =>
            context.registeredStrategies.has(factor.strategy),
          )
        ) {
          console.warn(
            `Clerk: Your instance is configured to support these 2FA strategies: ${clerk.client.signIn.supportedSecondFactors
              .map((f: SignInSecondFactor) => f.strategy)
              .join(', ')}, but the rendered strategies are: ${Array.from(context.registeredStrategies).join(
              ', ',
            )}. Make sure to render a <Strategy> component for each supported strategy. More information: https://clerk.com/docs/elements/reference/sign-in#strategy`,
          );
        }

        const strategiesUsedButNotActivated = Array.from(context.registeredStrategies).filter(
          strategy =>
            !clerk.client.signIn.supportedFirstFactors?.some(
              (supported: SignInFirstFactor) => supported.strategy === strategy,
            ),
        );

        if (strategiesUsedButNotActivated.length > 0) {
          console.warn(
            `Clerk: These rendered strategies are not configured for your instance: ${strategiesUsedButNotActivated.join(', ')}. If this is unexpected, make sure to enable them in your Clerk dashboard: https://dashboard.clerk.com/last-active?path=/user-authentication/email-phone-username`,
          );
        }

        if (context.currentFactor?.strategy && !context.registeredStrategies.has(context.currentFactor?.strategy)) {
          throw new ClerkElementsRuntimeError(
            `Your sign-in attempt is missing a ${context.currentFactor?.strategy} strategy. Make sure <Strategy name="${context.currentFactor?.strategy}"> is rendered in your flow. More information: https://clerk.com/docs/elements/reference/sign-in#strategy`,
          );
        } else if (!context.currentFactor?.strategy) {
          throw new ClerkElementsRuntimeError(
            'Unable to determine an authentication strategy to verify. This means your instance is misconfigured. Visit the Clerk Dashboard and verify that your instance has authentication strategies enabled: https://dashboard.clerk.com/last-active?path=/user-authentication/email-phone-username',
          );
        }
      }
    },
    sendToNext: ({ context, event }) =>
      context.parent.send({ type: 'NEXT', resource: (event as unknown as DoneActorEvent<SignInResource>).output }),
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
    setConsoleError: ({ event }) => {
      if (process.env.NODE_ENV !== 'development') {
        return;
      }

      assertActorEventError(event);

      const error = isClerkAPIResponseError(event.error) ? event.error.errors[0].longMessage : event.error.message;

      console.error(`Unable to fulfill the prepare or attempt request for the sign-in verification.
      Error: ${error}
      Please open an issue if you continue to run into this issue.`);
    },
  },
  guards: {
    isResendable: ({ context }) => context.resendable || context.resendableAfter === 0,
    isNeverResendable: ({ context }) => isNonPreparableStrategy(context.currentFactor?.strategy),
  },
  delays: SignInVerificationDelays,
  types: {} as SignInVerificationSchema,
}).createMachine({
  id: SignInVerificationMachineId,
  context: ({ input }) => ({
    currentFactor: null,
    basePath: input.basePath || SIGN_IN_DEFAULT_BASE_PATH,
    formRef: input.formRef,
    loadingStep: 'verifications',
    parent: input.parent,
    registeredStrategies: new Set<SignInStrategyName>(),
    resendable: false,
    resendableAfter: RESENDABLE_COUNTDOWN_DEFAULT,
  }),
  initial: 'Init',
  on: {
    'NAVIGATE.PREVIOUS': '.Hist',
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
    Init: {
      tags: ['state:preparing', 'state:loading'],
      invoke: {
        id: 'determineStartingFactor',
        src: 'determineStartingFactor',
        input: ({ context }) => ({
          parent: context.parent,
        }),
        onDone: {
          target: 'Preparing',
          actions: assign({
            currentFactor: ({ event }) => event.output,
          }),
        },
        onError: {
          target: 'Preparing',
          actions: [
            log('Clerk [Sign In Verification]: Error determining starting factor'),
            assign({
              currentFactor: { strategy: 'password' },
            }),
          ],
        },
      },
    },
    Preparing: {
      tags: ['state:preparing', 'state:loading'],
      invoke: {
        id: 'prepare',
        src: 'prepare',
        input: ({ context }) => ({
          parent: context.parent,
          resendable: context.resendable,
          params: {
            ...context.currentFactor,
            redirectUrl: `${window.location.origin}${context.basePath}${MAGIC_LINK_VERIFY_PATH_ROUTE}`,
          } as PrepareFirstFactorParams,
        }),
        onDone: {
          actions: 'resendableReset',
          target: 'Pending',
        },
        onError: {
          actions: ['setFormErrors', 'setConsoleError'],
          target: 'Pending',
        },
      },
    },
    Pending: {
      tags: ['state:pending'],
      description: 'Waiting for user input',
      on: {
        'AUTHENTICATE.PASSKEY': {
          target: 'AttemptingPasskey',
          reenter: true,
        },
        'NAVIGATE.CHOOSE_STRATEGY': 'ChooseStrategy',
        'NAVIGATE.FORGOT_PASSWORD': 'ChooseStrategy',
        RETRY: 'Preparing',
        SUBMIT: {
          target: 'Attempting',
          reenter: true,
        },
      },
      initial: 'Init',
      states: {
        Init: {
          description: 'Marks appropriate factors as never resendable.',
          always: [
            {
              guard: 'isNeverResendable',
              target: 'NeverResendable',
            },
            {
              target: 'NotResendable',
            },
          ],
        },
        Resendable: {
          description: 'Waiting for user to retry',
        },
        NeverResendable: {
          description: 'Handles never resendable',
          on: {
            RETRY: {
              actions: log('Never retriable'),
            },
          },
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
      after: {
        3000: {
          actions: 'validateRegisteredStrategies',
        },
      },
    },
    ChooseStrategy: {
      description: 'Handles both choose strategy and forgot password as the latter is similar in functionality',
      tags: ['state:choose-strategy', 'state:forgot-password'],
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
          currentFactor: context.currentFactor as SignInFirstFactor | null,
          fields: context.formRef.getSnapshot().context.fields,
        }),
        onDone: {
          actions: ['sendToNext', 'sendToLoading'],
        },
        onError: {
          actions: ['setFormErrors', 'setConsoleError', 'sendToLoading'],
          target: 'Pending',
        },
      },
    },
    AttemptingPasskey: {
      tags: ['state:attempting', 'state:loading'],
      entry: 'sendToLoading',
      invoke: {
        id: 'attemptPasskey',
        src: 'attemptPasskey',
        input: ({ context }) => ({
          parent: context.parent,
          flow: 'discoverable',
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
    Hist: {
      type: 'history',
    },
  },
});

export const SignInFirstFactorMachine = SignInVerificationMachine.provide({
  actors: {
    determineStartingFactor: fromPromise(async ({ input }) => {
      const clerk = input.parent.getSnapshot().context.clerk;

      return Promise.resolve(
        determineStartingSignInFactor(
          clerk.client.signIn.supportedFirstFactors,
          clerk.client.signIn.identifier,
          clerk.__unstable__environment?.displayConfig.preferredSignInStrategy,
        ),
      );
    }),
    prepare: fromPromise(async ({ input }) => {
      // `input` is a union of PrepareFirstFactor and PrepareSecondFactor. Since we're passing params to
      // prepareFirstFactor, we need to assert that the input is a PrepareFirstFactor. For some reason, ESLint thinks
      // the assertion is unnecessary, and will remove it during the pre-commit hook. To prevent that, we disable the
      // rule for the line.

      const { params, parent, resendable } = input as PrepareFirstFactorInput;
      const clerk = parent.getSnapshot().context.clerk;

      // If a prepare call has already been fired recently, don't re-send
      const currentVerificationExpiration = clerk.client.signIn.firstFactorVerification.expireAt;
      const needsPrepare = resendable || !currentVerificationExpiration || currentVerificationExpiration < new Date();

      if (isNonPreparableStrategy(params?.strategy) || !needsPrepare) {
        return Promise.resolve(clerk.client.signIn);
      }

      assertIsDefined(params, 'First factor params');
      return await clerk.client.signIn.prepareFirstFactor(params);
    }),
    attempt: fromPromise(async ({ input }) => {
      const { currentFactor, fields, parent } = input as AttemptFirstFactorInput;

      assertIsDefined(currentFactor, 'Current factor');

      let attemptParams: AttemptFirstFactorParams;

      const strategy = currentFactor.strategy;
      const code = fields.get('code')?.value as string | undefined;
      const password = fields.get('password')?.value as string | undefined;

      switch (strategy) {
        case 'passkey': {
          return await parent.getSnapshot().context.clerk.client.signIn.authenticateWithPasskey();
        }
        case 'password': {
          assertIsDefined(password, 'Password');

          attemptParams = {
            strategy,
            password,
          } satisfies PasswordAttempt;

          break;
        }
        case 'reset_password_phone_code':
        case 'reset_password_email_code': {
          assertIsDefined(code, 'Code for resetting phone/email');

          attemptParams = {
            strategy,
            code,
            password,
          } satisfies ResetPasswordPhoneCodeAttempt | ResetPasswordEmailCodeAttempt;

          break;
        }
        case 'phone_code':
        case 'email_code': {
          assertIsDefined(code, 'Code for phone/email');

          attemptParams = {
            strategy,
            code,
          } satisfies PhoneCodeAttempt | EmailCodeAttempt;

          break;
        }
        case 'web3_metamask_signature': {
          const signature = fields.get('signature')?.value as string | undefined;
          assertIsDefined(signature, 'Web3 Metamask signature');

          attemptParams = {
            strategy,
            signature,
          } satisfies Web3Attempt;

          break;
        }
        case 'web3_coinbase_wallet_signature': {
          const signature = fields.get('signature')?.value as string | undefined;
          assertIsDefined(signature, 'Web3 Coinbase Wallet signature');

          attemptParams = {
            strategy,
            signature,
          } satisfies Web3Attempt;

          break;
        }
        case 'web3_okx_wallet_signature': {
          const signature = fields.get('signature')?.value as string | undefined;
          assertIsDefined(signature, 'Web3 OKX Wallet signature');

          attemptParams = {
            strategy,
            signature,
          } satisfies Web3Attempt;

          break;
        }
        default:
          throw new ClerkElementsRuntimeError(`Invalid strategy: ${strategy}`);
      }

      return await parent.getSnapshot().context.clerk.client.signIn.attemptFirstFactor(attemptParams);
    }),
  },
});

export const SignInSecondFactorMachine = SignInVerificationMachine.provide({
  actors: {
    determineStartingFactor: fromPromise(async ({ input }) =>
      Promise.resolve(
        determineStartingSignInSecondFactor(
          input.parent.getSnapshot().context.clerk.client.signIn.supportedSecondFactors,
        ),
      ),
    ),
    prepare: fromPromise(async ({ input }) => {
      const { params, parent, resendable } = input as PrepareSecondFactorInput;
      const clerk = parent.getSnapshot().context.clerk;

      // If a prepare call has already been fired recently, don't re-send
      const currentVerificationExpiration = clerk.client.signIn.secondFactorVerification.expireAt;
      const needsPrepare = resendable || !currentVerificationExpiration || currentVerificationExpiration < new Date();

      assertIsDefined(params, 'Second factor params');

      if (params.strategy !== 'phone_code' || !needsPrepare) {
        return Promise.resolve(clerk.client.signIn);
      }

      return await clerk.client.signIn.prepareSecondFactor({
        strategy: params.strategy,
        phoneNumberId: params.phoneNumberId,
      });
    }),
    attempt: fromPromise(async ({ input }) => {
      const { fields, parent, currentFactor } = input as AttemptSecondFactorInput;

      const code = fields.get('code')?.value as string;

      assertIsDefined(currentFactor, 'Current factor');
      assertIsDefined(code, 'Code');

      return await parent.getSnapshot().context.clerk.client.signIn.attemptSecondFactor({
        strategy: currentFactor.strategy,
        code,
      });
    }),
  },
});
