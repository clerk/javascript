import { setup } from '../../machine/setup';
import type { Snapshot } from '../../machine/types';
import type {
  ReverificationDialogActions,
  ReverificationDialogErrors,
  ReverificationDialogMachineDependencies,
  ReverificationDialogState,
  ReverificationDialogSubmissionResult,
  ReverificationDialogViewProps,
  ReverificationFactor,
  ReverificationStage,
  ReverificationStrategy,
} from './reverification-dialog.types';

interface ReverificationDialogMachineContext extends ReverificationDialogState {
  pendingValue: string;
  prepare: ReverificationDialogMachineDependencies['prepare'];
  submit: ReverificationDialogMachineDependencies['submit'];
  resendAction: ReverificationDialogMachineDependencies['resend'];
  cancel: () => void;
  mapError: (error: unknown) => ReverificationDialogErrors;
}

export type ReverificationDialogMachineEvent =
  | { type: 'CHANGE_VALUE'; value: string }
  | { type: 'SUBMIT'; value?: string }
  | { type: 'RESEND' }
  | { type: 'CANCEL' }
  | { type: 'SELECT_FACTOR'; factorId: string }
  | { type: 'BACK' }
  | { type: 'RETRY_PREPARE' }
  | { type: 'SHOW_HELP' };

const { createMachine, assign, fromPromise } = setup<
  ReverificationDialogMachineContext,
  ReverificationDialogMachineEvent
>();

const requiresPreparation = (strategy: ReverificationStrategy) =>
  strategy === 'email_code' || strategy === 'phone_code';

const stageForStep = (step: ReverificationDialogState['step']): ReverificationStage =>
  step === 'select-second-factor' ? 'second' : 'first';

const machineStateFor = (state: ReverificationDialogState) => {
  if (state.step === 'prepare') {
    return state.preparationStatus === 'error' ? 'preparationFailed' : 'preparing';
  }

  switch (state.step) {
    case 'select-first-factor':
      return 'selectingFirstFactor';
    case 'select-second-factor':
      return 'selectingSecondFactor';
    case 'unavailable':
      return 'unavailable';
    case 'help':
      return 'help';
    default:
      return 'verifying';
  }
};

const operationFrom = (context: ReverificationDialogMachineContext) => ({
  strategy: context.strategy,
  stage: context.stage ?? stageForStep(context.step),
  identifier: context.identifier,
});

const selectFactor = (
  context: ReverificationDialogMachineContext,
  factorId: string,
): ReverificationFactor | undefined => context.availableFactors?.find(factor => factor.id === factorId);

const defaultMapError = (error: unknown): ReverificationDialogErrors => ({
  form: error instanceof Error ? error.message : String(error),
});

export function createReverificationDialogMachine(dependencies: ReverificationDialogMachineDependencies) {
  return createMachine({
    id: 'reverificationDialog',
    initial: context => machineStateFor(context),
    context: {
      ...dependencies.initialState,
      stage: dependencies.initialState.stage ?? stageForStep(dependencies.initialState.step),
      pendingValue: '',
      prepare: dependencies.prepare,
      submit: dependencies.submit,
      resendAction: dependencies.resend,
      cancel: dependencies.onCancel ?? (() => undefined),
      mapError: dependencies.mapError ?? defaultMapError,
    },
    states: {
      selectingFirstFactor: {
        on: {
          SELECT_FACTOR: {
            target: 'routingFactor',
            guard: (context, event) => Boolean(selectFactor(context, event.factorId)),
            actions: assign((context, event) => {
              const factor = selectFactor(context, event.factorId);
              if (!factor) {
                return {};
              }
              return {
                strategy: factor.strategy,
                stage: 'first',
                identifier: factor.identifier,
                value: '',
                status: 'idle',
                errors: {},
              };
            }),
          },
          SHOW_HELP: 'help',
          CANCEL: { target: 'cancelled', actions: context => context.cancel() },
        },
      },

      selectingSecondFactor: {
        on: {
          SELECT_FACTOR: {
            target: 'routingFactor',
            guard: (context, event) => Boolean(selectFactor(context, event.factorId)),
            actions: assign((context, event) => {
              const factor = selectFactor(context, event.factorId);
              if (!factor) {
                return {};
              }
              return {
                strategy: factor.strategy,
                stage: 'second',
                identifier: factor.identifier,
                value: '',
                status: 'idle',
                errors: {},
              };
            }),
          },
          BACK: 'selectingFirstFactor',
          SHOW_HELP: 'help',
          CANCEL: { target: 'cancelled', actions: context => context.cancel() },
        },
      },

      routingFactor: {
        always: [
          { target: 'preparing', guard: context => requiresPreparation(context.strategy) },
          { target: 'verifying' },
        ],
      },

      preparing: {
        invoke: fromPromise(context => context.prepare(operationFrom(context)), {
          onDone: {
            target: 'verifying',
            actions: assign(() => ({ preparationStatus: undefined, errors: {} })),
          },
          onError: {
            target: 'preparationFailed',
            actions: assign((context, event) => ({
              preparationStatus: 'error',
              errors: context.mapError(event.error),
            })),
          },
        }),
        on: {
          BACK: [
            { target: 'selectingSecondFactor', guard: context => context.stage === 'second' },
            { target: 'selectingFirstFactor' },
          ],
          CANCEL: { target: 'cancelled', actions: context => context.cancel() },
        },
      },

      preparationFailed: {
        on: {
          RETRY_PREPARE: {
            target: 'preparing',
            actions: assign(() => ({ preparationStatus: 'preparing', errors: {} })),
          },
          BACK: [
            { target: 'selectingSecondFactor', guard: context => context.stage === 'second' },
            { target: 'selectingFirstFactor' },
          ],
          CANCEL: { target: 'cancelled', actions: context => context.cancel() },
        },
      },

      verifying: {
        on: {
          CHANGE_VALUE: {
            actions: assign((_, event) => ({ value: event.value, status: 'idle', errors: {} })),
          },
          SUBMIT: {
            target: 'submitting',
            guard: (context, event) => context.strategy === 'passkey' || (event.value ?? context.value).length > 0,
            actions: assign((context, event) => ({
              pendingValue: event.value ?? context.value,
              status: 'verifying',
              errors: {},
            })),
          },
          RESEND: {
            target: 'resending',
            guard: context => requiresPreparation(context.strategy) && !context.resend.isResending,
          },
          BACK: [
            { target: 'selectingSecondFactor', guard: context => context.stage === 'second' },
            { target: 'selectingFirstFactor' },
          ],
          SHOW_HELP: 'help',
          CANCEL: { target: 'cancelled', actions: context => context.cancel() },
        },
      },

      submitting: {
        invoke: fromPromise(
          context =>
            context.submit({
              ...operationFrom(context),
              value: context.pendingValue,
            }),
          {
            onDone: [
              {
                target: 'unavailable',
                guard: (_, event) => event.output.status === 'needs_second_factor' && event.output.factors.length === 0,
                actions: assign(() => ({ status: 'idle', availableFactors: [] })),
              },
              {
                target: 'selectingSecondFactor',
                guard: (_, event) => event.output.status === 'needs_second_factor',
                actions: assign((_, event) => ({
                  stage: 'second',
                  value: '',
                  status: 'idle',
                  errors: {},
                  availableFactors: (
                    event.output as Extract<ReverificationDialogSubmissionResult, { status: 'needs_second_factor' }>
                  ).factors,
                })),
              },
              { target: 'complete' },
            ],
            onError: {
              target: 'verifying',
              actions: assign((context, event) => ({
                value: '',
                status: 'error',
                errors: context.mapError(event.error),
              })),
            },
          },
        ),
        on: {
          CANCEL: { target: 'cancelled', actions: context => context.cancel() },
        },
      },

      resending: {
        entry: assign(context => ({ resend: { ...context.resend, isResending: true } })),
        invoke: fromPromise(context => context.resendAction(operationFrom(context)), {
          onDone: {
            target: 'verifying',
            actions: assign(context => ({
              value: '',
              resend: { ...context.resend, isResending: false },
            })),
          },
          onError: {
            target: 'verifying',
            actions: assign((context, event) => ({
              resend: { ...context.resend, isResending: false },
              errors: context.mapError(event.error),
            })),
          },
        }),
        on: {
          CANCEL: { target: 'cancelled', actions: context => context.cancel() },
        },
      },

      unavailable: {
        on: {
          BACK: [
            { target: 'selectingSecondFactor', guard: context => context.stage === 'second' },
            { target: 'selectingFirstFactor' },
          ],
          CANCEL: { target: 'cancelled', actions: context => context.cancel() },
        },
      },

      help: {
        on: {
          BACK: [
            { target: 'selectingSecondFactor', guard: context => context.stage === 'second' },
            { target: 'selectingFirstFactor' },
          ],
          CANCEL: { target: 'cancelled', actions: context => context.cancel() },
        },
      },

      complete: { type: 'final' },
      cancelled: { type: 'final' },
    },
  });
}

export type ReverificationDialogMachineSnapshot = Snapshot<ReverificationDialogMachineContext>;

export function getReverificationDialogState(snapshot: ReverificationDialogMachineSnapshot): ReverificationDialogState {
  const { context } = snapshot;
  const step = (() => {
    switch (snapshot.value) {
      case 'selectingFirstFactor':
        return 'select-first-factor';
      case 'selectingSecondFactor':
        return 'select-second-factor';
      case 'preparing':
      case 'preparationFailed':
        return 'prepare';
      case 'unavailable':
        return 'unavailable';
      case 'help':
        return 'help';
      default:
        return 'verify';
    }
  })() satisfies ReverificationDialogState['step'];

  return {
    strategy: context.strategy,
    step,
    stage: context.stage,
    availableFactors: context.availableFactors,
    preparationStatus:
      snapshot.value === 'preparationFailed' ? 'error' : snapshot.value === 'preparing' ? 'preparing' : undefined,
    identifier: context.identifier,
    value: context.value,
    status: snapshot.value === 'submitting' ? 'verifying' : context.status,
    errors: context.errors,
    resend: context.resend,
  };
}

export function getReverificationDialogActions(
  send: (event: ReverificationDialogMachineEvent) => void,
): ReverificationDialogActions {
  return {
    onValueChange: value => send({ type: 'CHANGE_VALUE', value }),
    onSubmit: value => send({ type: 'SUBMIT', value }),
    onResend: () => send({ type: 'RESEND' }),
    onCancel: () => send({ type: 'CANCEL' }),
    onSelectFactor: factorId => send({ type: 'SELECT_FACTOR', factorId }),
    onBack: () => send({ type: 'BACK' }),
    onPrepare: () => send({ type: 'RETRY_PREPARE' }),
    onShowHelp: () => send({ type: 'SHOW_HELP' }),
  };
}

export function getReverificationDialogViewProps(
  snapshot: ReverificationDialogMachineSnapshot,
  send: (event: ReverificationDialogMachineEvent) => void,
): ReverificationDialogViewProps {
  const state = getReverificationDialogState(snapshot);
  const actions = getReverificationDialogActions(send);

  return {
    open: snapshot.status === 'active',
    strategy: state.strategy,
    step: state.step,
    availableFactors: state.availableFactors,
    preparationStatus: state.preparationStatus,
    identifier: state.identifier,
    value: state.value,
    isVerifying: state.status === 'verifying',
    fieldError: state.errors.field,
    formError: state.errors.form,
    isResending: state.resend.isResending,
    resendSecondsRemaining: state.resend.secondsRemaining,
    onOpenChange: open => {
      if (!open) {
        actions.onCancel();
      }
    },
    onValueChange: actions.onValueChange,
    onSubmit: actions.onSubmit,
    onResend: actions.onResend,
    onSelectFactor: actions.onSelectFactor,
    onBack: actions.onBack,
    onPrepare: actions.onPrepare,
    onShowHelp: actions.onShowHelp,
  };
}
