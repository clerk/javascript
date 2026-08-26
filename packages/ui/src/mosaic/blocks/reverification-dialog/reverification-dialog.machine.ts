import { setup } from '../../machine/setup';
import type { Snapshot } from '../../machine/types';
import { reverificationDialogMessages as m } from './reverification-dialog.messages';
import type {
  ReverificationAttempt,
  ReverificationAttemptResult,
  ReverificationChallenge,
  ReverificationDialogError,
  ReverificationDialogViewProps,
  ReverificationFactor,
  ReverificationPreparationFactor,
} from './reverification-dialog.types';

const RESEND_COOLDOWN_SECONDS = 30;

const emptyChallenge: ReverificationChallenge = {
  status: 'needs_first_factor',
  factors: [],
};

type ReverificationDialogReturnState = 'selectingFactor' | 'routingFactor';

export interface ReverificationDialogMachineContext {
  initialChallenge: ReverificationChallenge;
  challenge: ReverificationChallenge;
  currentFactor: ReverificationFactor | null;
  value: string;
  error: ReverificationDialogError | null;
  preparedFactorId: string | null;
  resendSecondsRemaining: number;
  returnState: ReverificationDialogReturnState;
  prepare: (factor: ReverificationPreparationFactor) => Promise<void>;
  attempt: (attempt: ReverificationAttempt) => Promise<ReverificationAttemptResult>;
  complete: () => void;
  cancel: () => void;
}

export type ReverificationDialogMachineEvent =
  | { type: 'CHANGE_VALUE'; value: string }
  | { type: 'SUBMIT' }
  | { type: 'RESEND' }
  | { type: 'CANCEL' }
  | { type: 'SELECT_FACTOR'; factorId: string }
  | { type: 'SHOW_ALTERNATIVES' }
  | { type: 'SHOW_HELP' }
  | { type: 'BACK' };

const { createMachine, assign, fromPromise } = setup<
  ReverificationDialogMachineContext,
  ReverificationDialogMachineEvent
>();

const factorsFrom = (context: ReverificationDialogMachineContext): ReverificationFactor[] => context.challenge.factors;

const factorFrom = (context: ReverificationDialogMachineContext, factorId: string) =>
  factorsFrom(context).find(factor => factor.id === factorId);

const initialFactorFrom = (challenge: ReverificationChallenge): ReverificationFactor | null =>
  challenge.initialFactorId
    ? (challenge.factors.find(factor => factor.id === challenge.initialFactorId) ?? null)
    : null;

const alternativesFrom = (context: ReverificationDialogMachineContext) =>
  factorsFrom(context).filter(factor => factor.id !== context.currentFactor?.id);

const hasAlternatives = (context: ReverificationDialogMachineContext) => alternativesFrom(context).length > 0;

const requiresPreparation = (factor: ReverificationFactor | null): factor is ReverificationPreparationFactor =>
  factor?.strategy === 'email_code' || factor?.strategy === 'phone_code';

const isFixedLengthCode = (factor: ReverificationFactor | null) =>
  factor?.strategy === 'email_code' || factor?.strategy === 'phone_code' || factor?.strategy === 'totp';

const normalizeValue = (factor: ReverificationFactor | null, value: string) =>
  isFixedLengthCode(factor) ? value.replace(/\D/g, '').slice(0, 6) : value;

const canSubmit = (context: ReverificationDialogMachineContext) => {
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

const attemptFrom = (context: ReverificationDialogMachineContext): ReverificationAttempt => {
  const factor = context.currentFactor;
  if (!factor) {
    throw new Error(m.genericError);
  }
  if (factor.strategy === 'password') {
    return { factor, password: context.value };
  }
  if (factor.strategy === 'passkey') {
    return { factor };
  }
  return { factor, code: context.value };
};

const errorFrom = (error: unknown, location: ReverificationDialogError['location']): ReverificationDialogError => ({
  location,
  message: error instanceof Error ? error.message : m.genericError,
});

const attemptErrorLocation = (context: ReverificationDialogMachineContext): ReverificationDialogError['location'] =>
  context.currentFactor?.strategy === 'passkey' ? 'form' : 'field';

const changeValue = ({
  context,
  event,
}: {
  context: ReverificationDialogMachineContext;
  event: Extract<ReverificationDialogMachineEvent, { type: 'CHANGE_VALUE' }>;
}) => {
  const value = normalizeValue(context.currentFactor, event.value);
  return {
    target: isFixedLengthCode(context.currentFactor) && value.length === 6 ? 'submitting' : undefined,
    context: { value, error: null },
  };
};

export const reverificationDialogMachine = createMachine({
  id: 'reverificationDialog',
  initial: 'initializing',
  context: {
    initialChallenge: emptyChallenge,
    challenge: emptyChallenge,
    currentFactor: null,
    value: '',
    error: null,
    preparedFactorId: null,
    resendSecondsRemaining: 0,
    returnState: 'selectingFactor',
    prepare: () => Promise.resolve(),
    attempt: () => Promise.resolve({ status: 'complete' }),
    complete: () => {},
    cancel: () => {},
  },
  states: {
    initializing: {
      entry: assign(context => ({ challenge: context.initialChallenge })),
      always: 'starting',
    },
    starting: {
      entry: assign(context => ({
        currentFactor: initialFactorFrom(context.challenge),
        value: '',
        error: null,
        preparedFactorId: null,
        resendSecondsRemaining: 0,
        returnState: 'selectingFactor',
      })),
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
          guard: (context, event) => Boolean(factorFrom(context, event.factorId)),
          actions: assign((context, event) => ({
            currentFactor: factorFrom(context, event.factorId) ?? context.currentFactor,
            value: '',
            error: null,
            preparedFactorId: null,
            resendSecondsRemaining: 0,
          })),
        },
        BACK: {
          target: 'routingFactor',
          guard: context => Boolean(context.currentFactor),
        },
        SHOW_HELP: {
          target: 'help',
          actions: assign(() => ({ returnState: 'selectingFactor' })),
        },
        CANCEL: 'cancelled',
      },
    },
    routingFactor: {
      always: [
        { target: 'unavailable', guard: context => !context.currentFactor },
        {
          target: 'preparing',
          guard: context =>
            requiresPreparation(context.currentFactor) && context.preparedFactorId !== context.currentFactor.id,
        },
        {
          target: 'verifyingCooldown',
          guard: context => context.resendSecondsRemaining > 0,
        },
        { target: 'verifying' },
      ],
    },
    preparing: {
      invoke: fromPromise(
        context => {
          if (!requiresPreparation(context.currentFactor)) {
            return Promise.reject(new Error(m.genericError));
          }
          return context.prepare(context.currentFactor);
        },
        {
          onDone: {
            target: 'verifyingCooldown',
            actions: assign(context => ({
              preparedFactorId: context.currentFactor?.id ?? null,
              resendSecondsRemaining: RESEND_COOLDOWN_SECONDS,
              error: null,
            })),
          },
          onError: {
            target: 'preparationFailed',
            actions: assign((_, event) => ({ error: errorFrom(event.error, 'form') })),
          },
        },
      ),
      on: {
        SHOW_ALTERNATIVES: { target: 'selectingFactor', guard: hasAlternatives },
        CANCEL: 'cancelled',
      },
    },
    preparationFailed: {
      on: {
        RESEND: 'preparing',
        SHOW_ALTERNATIVES: {
          target: 'selectingFactor',
          guard: hasAlternatives,
        },
        CANCEL: 'cancelled',
      },
    },
    verifying: {
      on: {
        CHANGE_VALUE: changeValue,
        SUBMIT: { target: 'submitting', guard: canSubmit },
        RESEND: { target: 'resending', guard: context => requiresPreparation(context.currentFactor) },
        SHOW_ALTERNATIVES: { target: 'selectingFactor', guard: hasAlternatives },
        SHOW_HELP: {
          target: 'help',
          guard: context => context.currentFactor?.strategy === 'password' && !hasAlternatives(context),
          actions: assign(() => ({ returnState: 'routingFactor' })),
        },
        CANCEL: 'cancelled',
      },
    },
    verifyingCooldown: {
      on: {
        CHANGE_VALUE: changeValue,
        SUBMIT: { target: 'submitting', guard: canSubmit },
        SHOW_ALTERNATIVES: { target: 'selectingFactor', guard: hasAlternatives },
        SHOW_HELP: {
          target: 'help',
          guard: context => context.currentFactor?.strategy === 'password' && !hasAlternatives(context),
          actions: assign(() => ({ returnState: 'routingFactor' })),
        },
        CANCEL: 'cancelled',
      },
      after: {
        1000: [
          {
            target: 'verifyingCooldown',
            guard: context => context.resendSecondsRemaining > 1,
            actions: assign(context => ({
              resendSecondsRemaining: context.resendSecondsRemaining - 1,
            })),
          },
          {
            target: 'verifying',
            actions: assign(() => ({ resendSecondsRemaining: 0 })),
          },
        ],
      },
    },
    submitting: {
      invoke: fromPromise(context => context.attempt(attemptFrom(context)), {
        onDone: [
          {
            target: 'completed',
            guard: (_, event) => event.output.status === 'complete',
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
                  initialFactorId: event.output.initialFactorId,
                },
              };
            }),
          },
        ],
        onError: ({ context, event }) => ({
          target: context.resendSecondsRemaining > 0 ? 'verifyingCooldown' : 'verifying',
          context: {
            value: '',
            error: errorFrom(event.error, attemptErrorLocation(context)),
          },
        }),
      }),
      on: { CANCEL: 'cancelled' },
    },
    resending: {
      invoke: fromPromise(
        context => {
          if (!requiresPreparation(context.currentFactor)) {
            return Promise.reject(new Error(m.genericError));
          }
          return context.prepare(context.currentFactor);
        },
        {
          onDone: {
            target: 'verifyingCooldown',
            actions: assign(context => ({
              preparedFactorId: context.currentFactor?.id ?? null,
              resendSecondsRemaining: RESEND_COOLDOWN_SECONDS,
              error: null,
            })),
          },
          onError: {
            target: 'verifying',
            actions: assign((_, event) => ({
              resendSecondsRemaining: 0,
              error: errorFrom(event.error, 'form'),
            })),
          },
        },
      ),
      on: {
        SHOW_ALTERNATIVES: { target: 'selectingFactor', guard: hasAlternatives },
        CANCEL: 'cancelled',
      },
    },
    help: {
      on: {
        BACK: ({ context }) => ({ target: context.returnState }),
        CANCEL: 'cancelled',
      },
    },
    unavailable: { on: { CANCEL: 'cancelled' } },
    completed: {
      type: 'final',
      entry: context => context.complete(),
    },
    cancelled: {
      type: 'final',
      entry: context => context.cancel(),
    },
  },
});

export type ReverificationDialogMachineSnapshot = Snapshot<ReverificationDialogMachineContext>;

export function getReverificationDialogViewProps(
  snapshot: ReverificationDialogMachineSnapshot,
  send: (event: ReverificationDialogMachineEvent) => void,
): ReverificationDialogViewProps {
  const context =
    snapshot.value === 'initializing'
      ? { ...snapshot.context, challenge: snapshot.context.initialChallenge }
      : snapshot.context;
  const open = snapshot.status === 'active';
  const base = {
    open,
    onOpenChange: (nextOpen: boolean) => {
      if (!nextOpen) {
        send({ type: 'CANCEL' });
      }
    },
  };
  const formError = context.error?.location === 'form' ? context.error.message : undefined;

  if (snapshot.value === 'unavailable') {
    return { ...base, step: 'unavailable' };
  }

  if (snapshot.value === 'help') {
    return {
      ...base,
      step: 'help',
      onBack: () => send({ type: 'BACK' }),
    };
  }

  if (snapshot.value === 'selectingFactor') {
    return {
      ...base,
      step: 'select-factor',
      stage: context.challenge.status === 'needs_first_factor' ? 'first' : 'second',
      availableFactors: context.currentFactor ? alternativesFrom(context) : factorsFrom(context),
      formError,
      onSelectFactor: factorId => send({ type: 'SELECT_FACTOR', factorId }),
      onBack: context.currentFactor ? () => send({ type: 'BACK' }) : undefined,
      onShowHelp: () => send({ type: 'SHOW_HELP' }),
    };
  }

  const factor = context.currentFactor ?? initialFactorFrom(context.challenge);
  if (!factor) {
    if (factorsFrom(context).length > 0) {
      return {
        ...base,
        step: 'select-factor',
        stage: context.challenge.status === 'needs_first_factor' ? 'first' : 'second',
        availableFactors: factorsFrom(context),
        onSelectFactor: factorId => send({ type: 'SELECT_FACTOR', factorId }),
        onShowHelp: () => send({ type: 'SHOW_HELP' }),
      };
    }
    return { ...base, step: 'unavailable' };
  }

  const isVerifying = snapshot.value === 'submitting';
  const isResending = snapshot.value === 'resending';
  const isInteractive = snapshot.value === 'verifying' || snapshot.value === 'verifyingCooldown';
  const isPreparing = snapshot.value === 'preparing';
  const preparationFailed = snapshot.value === 'preparationFailed';
  const canResend = (snapshot.value === 'verifying' || preparationFailed) && requiresPreparation(factor);
  const canShowAlternatives =
    (isInteractive || isPreparing || preparationFailed || isResending) && hasAlternatives(context);
  const canShowHelp = isInteractive && factor.strategy === 'password' && !hasAlternatives(context);

  return {
    ...base,
    step: 'verify',
    factor,
    value: context.value,
    canSubmit: isInteractive && canSubmit(context),
    isInputDisabled: !isInteractive,
    isVerifying,
    fieldError: context.error?.location === 'field' ? context.error.message : undefined,
    formError,
    resend: requiresPreparation(factor)
      ? {
          isResending: isResending || isPreparing,
          secondsRemaining: context.resendSecondsRemaining,
        }
      : undefined,
    onValueChange: value => send({ type: 'CHANGE_VALUE', value }),
    onSubmit: () => send({ type: 'SUBMIT' }),
    onResend: canResend ? () => send({ type: 'RESEND' }) : undefined,
    onShowAlternatives: canShowAlternatives ? () => send({ type: 'SHOW_ALTERNATIVES' }) : undefined,
    onShowHelp: canShowHelp ? () => send({ type: 'SHOW_HELP' }) : undefined,
  };
}
