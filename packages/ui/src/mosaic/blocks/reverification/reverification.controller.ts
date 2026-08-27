import { setup } from '../../machine/setup';
import type { Snapshot } from '../../machine/types';
import { reverificationBase as m } from './reverification.messages';
import type {
  ReverificationAttempt,
  ReverificationAttemptResult,
  ReverificationChallenge,
  ReverificationCompleteResult,
  ReverificationError,
  ReverificationFactor,
  ReverificationPreparationFactor,
} from './reverification.types';

const RESEND_COOLDOWN_SECONDS = 30;

const emptyChallenge: ReverificationChallenge = {
  status: 'needs_first_factor',
  factors: [],
};

export interface ReverificationControllerContext {
  /** The challenge injected by the view and captured when the actor starts. */
  initialChallenge: ReverificationChallenge;
  /** The active challenge, replaced when first-factor verification requires a second factor. */
  challenge: ReverificationChallenge;
  /** The factor currently being prepared or verified. */
  currentFactor: ReverificationFactor | null;
  /** The answer entered for the current factor. */
  value: string;
  /** Why the last operation failed and whether it belongs to the answer or the flow. */
  error: ReverificationError | null;
  /** The delivered-code factor most recently prepared. */
  preparedFactorKey: string | null;
  /** The successful verification retained while completion runs or retries. */
  verification: ReverificationCompleteResult | null;
  /** Timestamp after which another delivered code may be requested. */
  resendAvailableAt: number | null;
  /** Seconds left on {@link ReverificationControllerContext.resendAvailableAt}, for display. */
  resendSecondsRemaining: number;
  /** Sends a code. Injected by the view from its `prepare` prop. */
  prepare: (factor: ReverificationPreparationFactor) => Promise<void>;
  /** Checks an answer. Injected by the view from its `attempt` prop. */
  attempt: (attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>;
  /** Activates the verified session. Injected by the view from its `onComplete` prop. */
  complete: (result: ReverificationCompleteResult) => Promise<void>;
  /** Reports cancellation. Injected by the view from its `onCancel` prop. */
  cancel: () => void;
}

export type ReverificationControllerEvent =
  | { type: 'CHANGE_VALUE'; value: string }
  | { type: 'SUBMIT' }
  | { type: 'RESEND' }
  | { type: 'CANCEL' }
  | { type: 'SELECT_FACTOR'; factorKey: string }
  | { type: 'SHOW_ALTERNATIVES' }
  | { type: 'SHOW_HELP' }
  | { type: 'BACK' }
  | { type: 'RETRY_COMPLETE' };

const { createMachine, assign, fromPromise } = setup<ReverificationControllerContext, ReverificationControllerEvent>();

const factorsFrom = (context: ReverificationControllerContext): ReverificationFactor[] => context.challenge.factors;

const secondsUntilResend = (context: ReverificationControllerContext) =>
  context.resendAvailableAt === null ? 0 : Math.max(0, Math.ceil((context.resendAvailableAt - Date.now()) / 1000));

const isCoolingDown = (context: ReverificationControllerContext) => secondsUntilResend(context) > 0;

export const reverificationFactorKey = (factor: ReverificationFactor): string => {
  switch (factor.strategy) {
    case 'email_code':
      return `email_code:${factor.emailAddressId}`;
    case 'phone_code':
      return `phone_code:${factor.phoneNumberId}`;
    default:
      return factor.strategy;
  }
};

const assertValidChallenge = (challenge: ReverificationChallenge) => {
  const keys = challenge.factors.map(reverificationFactorKey);
  if (new Set(keys).size !== keys.length) {
    throw new Error('Reverification factors must have unique identities.');
  }
};

const factorFrom = (context: ReverificationControllerContext, factorKey: string) =>
  factorsFrom(context).find(factor => reverificationFactorKey(factor) === factorKey);

const initialFactorFrom = (challenge: ReverificationChallenge): ReverificationFactor | null => {
  const initialFactor = challenge.initialFactor;
  if (!initialFactor) {
    return null;
  }
  const initialFactorKey = reverificationFactorKey(initialFactor);
  return challenge.factors.find(factor => reverificationFactorKey(factor) === initialFactorKey) ?? null;
};

const alternativesFrom = (context: ReverificationControllerContext) =>
  factorsFrom(context).filter(
    factor =>
      !context.currentFactor || reverificationFactorKey(factor) !== reverificationFactorKey(context.currentFactor),
  );

const hasAlternatives = (context: ReverificationControllerContext) => alternativesFrom(context).length > 0;

const requiresPreparation = (factor: ReverificationFactor | null): factor is ReverificationPreparationFactor =>
  factor?.strategy === 'email_code' || factor?.strategy === 'phone_code';

const isFixedLengthCode = (factor: ReverificationFactor | null) =>
  factor?.strategy === 'email_code' || factor?.strategy === 'phone_code' || factor?.strategy === 'totp';

const normalizeValue = (factor: ReverificationFactor | null, value: string) =>
  isFixedLengthCode(factor) ? value.replace(/\D/g, '').slice(0, 6) : value;

const canSubmit = (context: ReverificationControllerContext) => {
  const factor = context.currentFactor;
  if (!factor) {
    return false;
  }
  if (factor.strategy === 'passkey') {
    return true;
  }
  if (isFixedLengthCode(factor)) {
    return context.value.length === 6;
  }
  return context.value.trim().length > 0;
};

const attemptFrom = (context: ReverificationControllerContext): ReverificationAttempt => {
  const factor = context.currentFactor;
  if (!factor) {
    throw new Error(m.unstable__errors__generic);
  }
  if (factor.strategy === 'password') {
    return { factor, password: context.value };
  }
  if (factor.strategy === 'passkey') {
    return { factor };
  }
  return { factor, code: context.value };
};

const errorFrom = (error: unknown): ReverificationError => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'scope' in error &&
    (error.scope === 'answer' || error.scope === 'flow') &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return { scope: error.scope, message: error.message };
  }
  return { scope: 'flow', message: error instanceof Error ? error.message : m.unstable__errors__generic };
};

const changeValue = ({
  context,
  event,
}: {
  context: ReverificationControllerContext;
  event: Extract<ReverificationControllerEvent, { type: 'CHANGE_VALUE' }>;
}) => {
  const value = normalizeValue(context.currentFactor, event.value);
  return {
    target: isFixedLengthCode(context.currentFactor) && value.length === 6 ? 'submitting' : undefined,
    context: { value, error: null },
  };
};

export const reverificationController = createMachine({
  id: 'reverification',
  initial: 'initializing',
  context: {
    initialChallenge: emptyChallenge,
    challenge: emptyChallenge,
    currentFactor: null,
    value: '',
    error: null,
    preparedFactorKey: null,
    verification: null,
    resendAvailableAt: null,
    resendSecondsRemaining: 0,
    prepare: () => Promise.resolve(),
    attempt: () => Promise.resolve({ status: 'complete', sessionId: '' }),
    complete: () => Promise.resolve(),
    cancel: () => {},
  },
  states: {
    initializing: {
      entry: assign(context => {
        assertValidChallenge(context.initialChallenge);
        return { challenge: context.initialChallenge };
      }),
      always: 'starting',
    },
    starting: {
      entry: assign(context => {
        assertValidChallenge(context.challenge);
        return {
          currentFactor: initialFactorFrom(context.challenge),
          value: '',
          error: null,
          preparedFactorKey: null,
          verification: null,
          resendAvailableAt: null,
          resendSecondsRemaining: 0,
        };
      }),
      always: [
        { target: 'unavailable', guard: context => factorsFrom(context).length === 0 },
        { target: 'routingFactor', guard: context => Boolean(context.currentFactor) },
        { target: 'selectingFactor' },
      ],
    },
    selectingFactor: {
      on: {
        SELECT_FACTOR: {
          target: 'routingFactor',
          guard: (context, event) => Boolean(factorFrom(context, event.factorKey)),
          actions: assign((context, event) => ({
            currentFactor: factorFrom(context, event.factorKey) ?? context.currentFactor,
            value: '',
            error: null,
            preparedFactorKey: null,
            resendAvailableAt: null,
            resendSecondsRemaining: 0,
          })),
        },
        BACK: {
          target: 'routingFactor',
          guard: context => Boolean(context.currentFactor),
        },
        SHOW_HELP: {
          target: 'helpFromSelection',
        },
        CANCEL: 'cancelled',
      },
    },
    routingFactor: {
      always: [
        { target: 'unavailable', guard: context => !context.currentFactor },
        // Ahead of the preparation guard: a failed send leaves the factor unprepared, and
        // routing straight back into `preparing` would resend inside its own cooldown.
        { target: 'verifyingCooldown', guard: isCoolingDown },
        {
          target: 'preparing',
          guard: context =>
            requiresPreparation(context.currentFactor) &&
            context.preparedFactorKey !== reverificationFactorKey(context.currentFactor),
        },
        { target: 'verifying' },
      ],
    },
    preparing: {
      // The cooldown is committed when the request goes out, not when it lands, so a slow or
      // failing send cannot be retried sooner than a fast one. Matches legacy's TimerButton,
      // which disabled itself on click rather than on response.
      entry: assign(() => ({
        resendAvailableAt: Date.now() + RESEND_COOLDOWN_SECONDS * 1000,
        resendSecondsRemaining: RESEND_COOLDOWN_SECONDS,
        value: '',
        error: null,
      })),
      invoke: fromPromise(
        context => {
          if (!requiresPreparation(context.currentFactor)) {
            return Promise.reject(new Error(m.unstable__errors__generic));
          }
          return context.prepare(context.currentFactor);
        },
        {
          onDone: {
            target: 'verifyingCooldown',
            actions: assign(context => ({
              preparedFactorKey: context.currentFactor ? reverificationFactorKey(context.currentFactor) : null,
              error: null,
            })),
          },
          // Legacy had no failure screen: the error lands on the code card the user is already
          // looking at, and an earlier code stays submittable.
          onError: {
            target: 'verifyingCooldown',
            actions: assign((_, event) => ({ error: errorFrom(event.error) })),
          },
        },
      ),
      on: {
        SHOW_ALTERNATIVES: { target: 'selectingFactor', guard: hasAlternatives },
        CANCEL: 'cancelled',
      },
    },
    verifying: {
      on: {
        CHANGE_VALUE: changeValue,
        SUBMIT: { target: 'submitting', guard: canSubmit },
        RESEND: { target: 'preparing', guard: context => requiresPreparation(context.currentFactor) },
        SHOW_ALTERNATIVES: { target: 'selectingFactor', guard: hasAlternatives },
        SHOW_HELP: {
          target: 'helpFromFactor',
          guard: context => context.currentFactor?.strategy === 'password' && !hasAlternatives(context),
        },
        CANCEL: 'cancelled',
      },
    },
    verifyingCooldown: {
      entry: assign(context => ({ resendSecondsRemaining: secondsUntilResend(context) })),
      on: {
        CHANGE_VALUE: changeValue,
        SUBMIT: { target: 'submitting', guard: canSubmit },
        SHOW_ALTERNATIVES: { target: 'selectingFactor', guard: hasAlternatives },
        SHOW_HELP: {
          target: 'helpFromFactor',
          guard: context => context.currentFactor?.strategy === 'password' && !hasAlternatives(context),
        },
        CANCEL: 'cancelled',
      },
      after: {
        1000: [
          { target: 'verifyingCooldown', guard: isCoolingDown },
          { target: 'verifying', actions: assign(() => ({ resendSecondsRemaining: 0 })) },
        ],
      },
    },
    submitting: {
      invoke: fromPromise(context => context.attempt(attemptFrom(context)), {
        onDone: [
          {
            target: 'completing',
            guard: (_, event) => event.output.status === 'complete',
            actions: assign((_, event) => ({
              verification: event.output.status === 'complete' ? event.output : null,
              error: null,
            })),
          },
          {
            target: 'starting',
            guard: (_, event) => event.output.status === 'needs_second_factor',
            actions: assign((_, event) => {
              if (event.output.status !== 'needs_second_factor') {
                return {};
              }
              return {
                challenge: {
                  status: 'needs_second_factor',
                  factors: event.output.factors,
                  initialFactor: event.output.initialFactor,
                },
              };
            }),
          },
        ],
        // Legacy reset only the OTP control; password and backup code kept what was typed.
        onError: ({ context, event }) => ({
          target: isCoolingDown(context) ? 'verifyingCooldown' : 'verifying',
          context: {
            value: isFixedLengthCode(context.currentFactor) ? '' : context.value,
            error: errorFrom(event.error),
          },
        }),
      }),
      on: { CANCEL: 'cancelled' },
    },
    helpFromSelection: {
      on: {
        BACK: 'selectingFactor',
        CANCEL: 'cancelled',
      },
    },
    helpFromFactor: {
      on: {
        BACK: 'routingFactor',
        CANCEL: 'cancelled',
      },
    },
    unavailable: { on: { CANCEL: 'cancelled' } },
    completing: {
      invoke: fromPromise(
        context => {
          if (!context.verification) {
            return Promise.reject(new Error(m.unstable__errors__generic));
          }
          return context.complete(context.verification);
        },
        {
          onDone: 'completed',
          onError: {
            target: 'completionFailed',
            actions: assign((_, event) => ({ error: errorFrom(event.error) })),
          },
        },
      ),
    },
    completionFailed: {
      on: {
        RETRY_COMPLETE: 'completing',
        CANCEL: 'cancelled',
      },
    },
    completed: { type: 'final' },
    cancelled: {
      type: 'final',
      entry: context => context.cancel(),
    },
  },
});

export type ReverificationControllerSnapshot = Snapshot<ReverificationControllerContext>;
