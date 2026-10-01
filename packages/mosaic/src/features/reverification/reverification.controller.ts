import { useEffect, useState } from 'react';

import type { FlowDirection } from '../../components/flow';
import { useMessages } from '../../localization';
import { setup } from '../../machine/setup';
import type { DoneInvokeEvent, StateConfig } from '../../machine/types';
import { useMachine } from '../../machine/useMachine';
import type { ReverificationActiveModel, ReverificationModel } from './reverification.model';
import type {
  ReverificationErrorReason,
  ReverificationMethod,
  ReverificationResult,
  ReverificationStep,
  ReverificationViewProps,
} from './reverification.types';
import { errorDetail, needsPrepare, otpChannelFor } from './reverification.utils';

export type ReverificationController =
  | { status: 'idle'; onCancel?: undefined }
  | { status: 'loading'; onCancel?: () => void }
  | { status: 'error'; reason: ReverificationErrorReason; onCancel?: () => void }
  | ({ status: 'ready'; onCancel?: () => void } & ReverificationViewProps)
  | ({ status: 'retrying'; onCancel?: undefined } & ReverificationViewProps);

type OverlayFrom = 'factor' | 'method-picker';

export type ReverificationDeps = Pick<ReverificationActiveModel, 'start' | 'prepare' | 'attempt' | 'finish'>;

interface FactorError {
  detail: string | undefined;
}

interface ReverificationContext {
  inputValue: string;
  error: FactorError | undefined;
  direction: FlowDirection;
  activeMethod: ReverificationMethod | null;
  methods: readonly ReverificationMethod[];
  resendAvailableAt: number | undefined;
  submitRequested: boolean;
  frozenActiveMethodId: string | undefined;
  overlayFrom: OverlayFrom;
  supportEmail: string;
  deps: ReverificationDeps;
}

type ReverificationEvent =
  | { type: 'START' }
  | { type: 'RESET' }
  | { type: 'TYPE'; value: string }
  | { type: 'SUBMIT' }
  | { type: 'SHOW_METHODS' }
  | { type: 'SHOW_HELP' }
  | { type: 'SELECT_METHOD'; id: string }
  | { type: 'BACK' }
  | { type: 'RESEND' };

const { createMachine, assign, fromPromise } = setup<ReverificationContext, ReverificationEvent>();

function notSeated(): Promise<never> {
  return Promise.reject(new Error('reverification deps are not seated'));
}

const unseatedDeps: ReverificationDeps = {
  start: notSeated,
  prepare: notSeated,
  attempt: notSeated,
  finish: notSeated,
};

export const RESEND_COOLDOWN_MS = 30_000;

function lockResend(): Pick<ReverificationContext, 'resendAvailableAt'> {
  return { resendAvailableAt: Date.now() + RESEND_COOLDOWN_MS };
}

function unlockResend(): Pick<ReverificationContext, 'resendAvailableAt'> {
  return { resendAvailableAt: undefined };
}

function factorError(error: unknown): FactorError {
  return { detail: errorDetail(error) };
}

function selectMethod(ctx: ReverificationContext, id: string): Partial<ReverificationContext> {
  return {
    activeMethod: ctx.methods.find(method => method.id === id) ?? ctx.activeMethod,
    inputValue: '',
    error: undefined,
    direction: 1,
    submitRequested: false,
  };
}

function prepareActive(ctx: ReverificationContext) {
  const method = ctx.activeMethod;
  return method && needsPrepare(method) ? ctx.deps.prepare(method) : Promise.resolve();
}

function submit(ctx: ReverificationContext): Promise<ReverificationResult> {
  const method = ctx.activeMethod;
  if (!method) {
    return Promise.reject(new Error('No active method'));
  }
  return ctx.deps.attempt(method, ctx.inputValue);
}

const applyResult = assign<DoneInvokeEvent<ReverificationResult>>((_, event) => ({
  methods: event.output.methods,
  activeMethod: event.output.startingMethod,
  inputValue: '',
  error: undefined,
  ...unlockResend(),
  direction: 1,
}));
const afterResult = [
  {
    guard: (_: ReverificationContext, event: DoneInvokeEvent<ReverificationResult>) =>
      event.output.status === 'complete',
    target: 'finishing' as const,
    // We don't apply the result here as we want to keep the old one visible as we are finishing
  },
  {
    guard: (_: ReverificationContext, event: DoneInvokeEvent<ReverificationResult>) =>
      event.output.startingMethod === null,
    target: 'unavailable' as const,
    actions: applyResult,
  },
  {
    guard: (_: ReverificationContext, event: DoneInvokeEvent<ReverificationResult>) => {
      const method = event.output.startingMethod;
      return Boolean(method && needsPrepare(method));
    },
    target: 'preparing' as const,
    actions: [applyResult, assign(() => lockResend())],
  },
  { target: 'verifying' as const, actions: applyResult },
];

const factorEvents = {
  TYPE: {
    actions: assign((_, event) => ({ inputValue: event.value, error: undefined })),
  },
  SHOW_METHODS: {
    target: 'methodPicker',
    guard: ctx => ctx.methods.filter(method => method.id !== ctx.activeMethod?.id).length > 0,
    actions: assign(ctx => ({
      direction: 1 as const,
      overlayFrom: 'factor' as const,
      submitRequested: false,
      frozenActiveMethodId: ctx.activeMethod?.id,
    })),
  },
  SHOW_HELP: {
    target: 'help',
    actions: assign(() => ({
      direction: 1 as const,
      overlayFrom: 'factor' as const,
      submitRequested: false,
    })),
  },
  RESET: 'inactive',
} satisfies NonNullable<StateConfig<ReverificationContext, ReverificationEvent>['on']>;

export const reverificationMachine = createMachine({
  id: 'reverification',
  initial: 'inactive',
  context: {
    inputValue: '',
    error: undefined,
    direction: 1,
    activeMethod: null,
    methods: [],
    resendAvailableAt: undefined,
    submitRequested: false,
    frozenActiveMethodId: undefined,
    overlayFrom: 'factor',
    supportEmail: '',
    deps: unseatedDeps,
  },
  states: {
    inactive: {
      entry: assign(() => ({
        inputValue: '',
        error: undefined,
        submitRequested: false,
        ...unlockResend(),
      })),
      on: { START: 'starting' },
    },

    starting: {
      on: { RESET: 'inactive' },
      invoke: fromPromise(ctx => ctx.deps.start(), {
        onDone: afterResult,
        onError: 'failed',
      }),
    },

    /*
      Preparing a factor behind the scenes (e.g. sending an OTP)

      This shows the factor card with optimistic UI, so it needs to handle the same actions
      as verifying, but if the user submits, we queue that up until after prepare resolves
    */
    preparing: {
      on: {
        ...factorEvents,
        SUBMIT: {
          actions: assign(() => ({ submitRequested: true })),
        },
      },
      invoke: fromPromise(prepareActive, {
        onDone: [
          {
            guard: (ctx: ReverificationContext) => ctx.submitRequested,
            target: 'submitting' as const,
            actions: assign(() => ({ submitRequested: false })),
          },
          { target: 'verifying' as const },
        ],
        onError: {
          target: 'verifying',
          actions: assign((_, event) => ({
            error: factorError(event.error),
            submitRequested: false,
            ...unlockResend(),
          })),
        },
      }),
    },

    /*
      When selecting a method from the picker, we prepare before going to the factor card

      We don't use optimistic UI here simply because we're in a better position to show
      some feedback that does not feel janky. The view handles disabling inputs while preparing.
    */
    methodPickerPreparing: {
      entry: assign(() => lockResend()),
      on: { RESET: 'inactive' },
      invoke: fromPromise(prepareActive, {
        onDone: 'verifying',
        onError: {
          target: 'verifying',
          actions: assign((_, event) => ({ error: factorError(event.error), ...unlockResend() })),
        },
      }),
    },

    verifying: {
      always: [{ guard: ctx => ctx.activeMethod === null, target: 'unavailable' }],
      on: {
        ...factorEvents,
        SUBMIT: 'submitting',
        RESEND: {
          target: 'preparing',
          guard: ctx =>
            Boolean(ctx.activeMethod && needsPrepare(ctx.activeMethod)) &&
            (ctx.resendAvailableAt === undefined || Date.now() >= ctx.resendAvailableAt),
          actions: assign(() => ({
            ...lockResend(),
            inputValue: '',
            error: undefined,
            submitRequested: false,
          })),
        },
      },
    },

    submitting: {
      on: { RESET: 'inactive' },
      invoke: fromPromise(submit, {
        onDone: afterResult,
        onError: {
          target: 'verifying',
          actions: assign((_, event) => ({ error: factorError(event.error) })),
        },
      }),
    },

    methodPicker: {
      on: {
        SELECT_METHOD: [
          {
            target: 'methodPickerPreparing',
            guard: (ctx, event) => {
              const method = ctx.methods.find(candidate => candidate.id === event.id);
              return Boolean(method && needsPrepare(method));
            },
            actions: assign((ctx, event) => selectMethod(ctx, event.id)),
          },
          { target: 'verifying', actions: assign((ctx, event) => selectMethod(ctx, event.id)) },
        ],
        SHOW_HELP: {
          target: 'help',
          actions: assign(() => ({ direction: 1 as const, overlayFrom: 'method-picker' as const })),
        },
        BACK: { target: 'verifying', actions: assign(() => ({ direction: -1 as const })) },
        RESET: 'inactive',
      },
    },

    help: {
      on: {
        BACK: [
          {
            target: 'methodPicker',
            guard: ctx => ctx.overlayFrom === 'method-picker',
            actions: assign(() => ({ direction: -1 as const })),
          },
          { target: 'verifying', actions: assign(() => ({ direction: -1 as const })) },
        ],
        RESET: 'inactive',
      },
    },

    unavailable: {
      on: { RESET: 'inactive' },
    },

    failed: {
      on: { RESET: 'inactive' },
    },

    finishing: {
      on: { RESET: 'inactive' },
      invoke: fromPromise(ctx => ctx.deps.finish(), {
        onDone: 'retrying',
        onError: 'failed',
      }),
    },

    // This means we are retrying the action after successful reverification
    // This state is usually left by the model state going to 'inactive',
    // which it does when the retry has completed
    retrying: {
      on: { RESET: 'inactive' },
    },
  },
});

const pendingStates = new Set(['submitting', 'finishing', 'retrying']);

function factorStep(method: ReverificationMethod): ReverificationStep {
  if (method.strategy === 'password') {
    return 'password';
  }
  if (method.strategy === 'passkey') {
    return 'passkey';
  }
  if (method.strategy === 'backup_code') {
    return 'backup-code';
  }
  return 'otp';
}

function viewStep(value: string, method: ReverificationMethod | null): ReverificationStep | undefined {
  if (value === 'methodPicker' || value === 'methodPickerPreparing') {
    return 'method-picker';
  }
  if (value === 'help') {
    return 'help';
  }
  if (
    value === 'verifying' ||
    value === 'submitting' ||
    value === 'preparing' ||
    value === 'finishing' ||
    value === 'retrying'
  ) {
    if (!method) {
      return undefined;
    }
    return factorStep(method);
  }
  return undefined;
}

/**
 * Machine - State internal to the controller, not all steps are exposed to the UI
 * Return 'ReverificationController' - The view state
 *   - status: 'idle' renders nothing
 *   - status: 'loading' | 'error' carry no factor props
 *   - status: 'ready' | 'retrying' carry the factor view, including step
 *
 * There are two pending presentations.
 *   - status: 'loading' is the pending card rendered in place, before a factor exists
 *   - status: 'ready' && isPending is the inline pending state of the current factor
 *
 * 'retrying' is the point of no return: verification succeeded and the original action is being
 * retried, so it keeps the last factor pending and has no `onCancel`. The factor machine runs
 * while the model is active and resets when the model returns to inactive.
 */
export function useReverificationController(model: ReverificationModel): ReverificationController {
  const m = useMessages('reverification');
  const active = model.status === 'active' ? model : null;

  const [snapshot, send] = useMachine(
    reverificationMachine,
    active
      ? {
          context: {
            supportEmail: active.supportEmail,
            deps: active,
          },
        }
      : undefined,
  );

  const [now, setNow] = useState(() => Date.now());
  const resendAvailableAt = snapshot.context.resendAvailableAt;
  const canResend = resendAvailableAt === undefined || now >= resendAvailableAt;
  const countingDown = !canResend;

  useEffect(() => {
    if (!countingDown) {
      return;
    }
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [countingDown, resendAvailableAt]);

  const cancelModel =
    (model.status === 'loading' || model.status === 'active') && snapshot.value !== 'retrying'
      ? model.cancel
      : undefined;
  const onCancel = cancelModel
    ? () => {
        send({ type: 'RESET' });
        cancelModel();
      }
    : undefined;
  const needsStart = active !== null && snapshot.value === 'inactive';
  const needsReset = model.status === 'inactive' && snapshot.value !== 'inactive';
  useEffect(() => {
    if (needsStart) {
      send({ type: 'START' });
    } else if (needsReset) {
      send({ type: 'RESET' });
    }
  }, [needsStart, needsReset, send]);

  if (model.status === 'inactive') {
    return { status: 'idle' };
  }

  const { context } = snapshot;
  const activeMethod = context.activeMethod;

  if (snapshot.value === 'unavailable') {
    return { status: 'error', reason: 'noFactors', onCancel };
  }

  if (snapshot.value === 'failed') {
    return { status: 'error', reason: 'generic', onCancel };
  }

  const step = viewStep(snapshot.value, activeMethod);

  if (!step) {
    return { status: 'loading', onCancel };
  }

  // If we are currently on the alternative methods screen and preparing a factor, activeMethod will
  // have transitioned to the factor we are now preparing, so the one we want to hide is the old one
  const excludeId = snapshot.value === 'methodPickerPreparing' ? context.frozenActiveMethodId : activeMethod?.id;
  const methods = context.methods.filter(method => method.id !== excludeId);
  const pendingMethodId = snapshot.value === 'methodPickerPreparing' ? activeMethod?.id : undefined;

  const view: ReverificationViewProps = {
    step,
    direction: context.direction,
    value: context.inputValue,
    onValueChange: (value: string) => send({ type: 'TYPE', value }),
    errorMessage: context.error ? (context.error.detail ?? m.unstable__errors__generic) : undefined,
    isPending: pendingStates.has(snapshot.value),
    onSubmit: () => send({ type: 'SUBMIT' }),
    onShowMethods: () => send({ type: 'SHOW_METHODS' }),
    onShowHelp: () => send({ type: 'SHOW_HELP' }),
    onBack: () => send({ type: 'BACK' }),
    onEmailSupport: () => {
      if (context.supportEmail) {
        window.location.assign(`mailto:${context.supportEmail}`);
      }
    },
    methods,
    pendingMethodId,
    onSelectMethod: (id: string) => send({ type: 'SELECT_METHOD', id }),
    otpChannel: activeMethod ? otpChannelFor(activeMethod.strategy) : undefined,
    onResend: () => send({ type: 'RESEND' }),
    canResend,
    // We clamp this to 30s because the first render after locking resend
    // will have the old `now` state set, which would result in a value above
    // 30s. There are other solutions like reading Date.now() in render and
    // letting the interval only retrigger render, but that makes the render
    // impure which is something the React compiler would warn about.
    // useSyncExternalStore feels unnecessarily complex here
    resendRemainingSeconds:
      countingDown && resendAvailableAt
        ? Math.min(RESEND_COOLDOWN_MS / 1000, Math.max(0, Math.ceil((resendAvailableAt - now) / 1000)))
        : undefined,
  };

  return snapshot.value === 'retrying' ? { status: 'retrying', ...view } : { status: 'ready', onCancel, ...view };
}
