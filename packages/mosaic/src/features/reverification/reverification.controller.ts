import { isClerkRuntimeError } from '@clerk/shared/error';
import { useEffect, useMemo, useState } from 'react';

import type { FlowDirection } from '../../components/flow';
import type { ErrorDescription } from '../../localization';
import { useErrorText, useMessages } from '../../localization';
import { setup } from '../../machine/setup';
import type { DoneInvokeEvent, ErrorInvokeEvent, StateConfig } from '../../machine/types';
import { useMachine } from '../../machine/use-machine';
import { toLocalizableError } from '../../utils/errors';
import type {
  ReverificationActiveModel,
  ReverificationModel,
  ReverificationPreparation,
  ReverificationScope,
} from './reverification.model';
import type {
  ReverificationErrorReason,
  ReverificationMethod,
  ReverificationPreparableMethod,
  ReverificationResult,
  ReverificationStep,
  ReverificationViewProps,
} from './reverification.types';
import { needsPrepare, otpChannelFor } from './reverification.utils';

type ReverificationControllerState =
  | { status: 'idle'; onCancel?: undefined }
  | { status: 'loading'; onCancel?: () => void }
  | { status: 'error'; reason: ReverificationErrorReason; onCancel?: () => void }
  | ({ status: 'ready'; onCancel?: () => void } & ReverificationViewProps)
  | ({ status: 'retrying'; onCancel?: undefined } & ReverificationViewProps);

export type ReverificationController = ReverificationControllerState & {
  /**
   * Whether reverification has a card of its own to show: a factor or an error. The pending card
   * shown before a factor exists is not counted, so a host can keep its own pending state on
   * screen until this turns true. False again as soon as the run ends or the user cancels.
   */
  visible: boolean;
};

type Overlay = Extract<ReverificationStep, 'method-picker' | 'help'>;

export type ReverificationDeps = Pick<ReverificationActiveModel, 'start' | 'prepare' | 'attempt' | 'finish'>;

type RetainedPreparation = {
  method: ReverificationPreparableMethod;
  expiresAt: number;
  resendAvailableAt: number;
};

interface ReverificationContext {
  scope: ReverificationScope | null;
  requestedScope: ReverificationScope | null;
  operationScope: ReverificationScope | null;
  retainedPreparation: RetainedPreparation | null;
  preparation: {
    method: ReverificationPreparableMethod;
    resendAvailableAt: number;
    presentation: 'factor' | 'picker';
  } | null;
  inputValue: string;
  error: ErrorDescription | undefined;
  direction: FlowDirection;
  activeMethod: ReverificationMethod | null;
  methods: readonly ReverificationMethod[];
  resendAvailableAt: number | undefined;
  submitRequested: boolean;
  frozenActiveMethodId: string | undefined;
  overlay: readonly Overlay[];
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

function unlockResend(): Pick<ReverificationContext, 'resendAvailableAt'> {
  return { resendAvailableAt: undefined };
}

function isPasskeyAbortedError(error: unknown): boolean {
  return isClerkRuntimeError(error) && error.code === 'passkey_operation_aborted';
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
  const preparation = ctx.preparation;
  return preparation ? ctx.deps.prepare(preparation.method) : Promise.reject(new Error('No preparation'));
}

function submit(ctx: ReverificationContext): Promise<ReverificationResult> {
  const method = ctx.activeMethod;
  if (!method) {
    return Promise.reject(new Error('No active method'));
  }
  return ctx.deps.attempt(method, ctx.inputValue);
}

function sameMethod(a: ReverificationMethod | null, b: ReverificationMethod | null): boolean {
  return Boolean(a && b && a.stage === b.stage && a.strategy === b.strategy && a.id === b.id);
}

function beginPreparation(ctx: ReverificationContext): Partial<ReverificationContext> {
  const method = ctx.activeMethod;
  if (!method || !needsPrepare(method)) {
    return {};
  }
  const resendAvailableAt = Date.now() + RESEND_COOLDOWN_MS;
  return {
    retainedPreparation: null,
    resendAvailableAt,
    preparation: { method, resendAvailableAt, presentation: topOverlay(ctx) === 'method-picker' ? 'picker' : 'factor' },
  };
}

function sameScope(a: ReverificationScope | null, b: ReverificationScope | null): boolean {
  return a?.runId === b?.runId && a?.sessionId === b?.sessionId;
}

function settledRun(ctx: ReverificationContext) {
  if (!ctx.scope) {
    return 'inactive' as const;
  }
  if (!sameScope(ctx.scope, ctx.operationScope)) {
    return 'starting' as const;
  }
  return undefined;
}

function clearRun(): Partial<ReverificationContext> {
  return {
    scope: null,
    retainedPreparation: null,
    activeMethod: null,
    methods: [],
    inputValue: '',
    error: undefined,
    submitRequested: false,
    overlay: [],
    frozenActiveMethodId: undefined,
    ...unlockResend(),
  };
}

const bindRun = assign(ctx => ({ ...clearRun(), scope: ctx.requestedScope }));
const drainingEvents = {
  RESET: { actions: assign(clearRun) },
  START: { actions: bindRun },
};
const afterDrain = [
  { guard: (ctx: ReverificationContext) => settledRun(ctx) === 'inactive', target: 'inactive' as const },
  { guard: (ctx: ReverificationContext) => settledRun(ctx) === 'starting', target: 'starting' as const },
];

function settlePreparation(
  ctx: ReverificationContext,
  result: { status: 'sent'; verification: ReverificationPreparation } | { status: 'failed'; error: unknown },
) {
  const drained = settledRun(ctx);
  if (drained) {
    return { target: drained };
  }
  const preparation = ctx.preparation;
  const method = ctx.activeMethod;
  if (!preparation || !method) {
    return { target: 'inactive' as const };
  }
  if (needsPrepare(method) && !sameMethod(method, preparation.method)) {
    return { target: 'preparing' as const };
  }
  const matches = sameMethod(method, preparation.method);
  const verification = result.status === 'sent' ? result.verification : null;
  const retainedPreparation =
    verification?.status === 'unverified' &&
    verification.strategy === preparation.method.strategy &&
    verification.expiresAt !== null &&
    Number.isFinite(verification.expiresAt) &&
    verification.expiresAt > Date.now()
      ? {
          method: preparation.method,
          expiresAt: verification.expiresAt,
          resendAvailableAt: preparation.resendAvailableAt,
        }
      : null;
  return {
    target:
      ctx.submitRequested && (result.status === 'sent' || !matches) ? ('submitting' as const) : ('verifying' as const),
    context: {
      retainedPreparation,
      preparation: null,
      resendAvailableAt: result.status === 'sent' ? preparation.resendAvailableAt : undefined,
      overlay: preparation.presentation === 'picker' ? [] : ctx.overlay,
      error: matches && result.status === 'failed' ? toLocalizableError(result.error) : ctx.error,
      submitRequested: false,
    },
  };
}

const applyResult = assign<DoneInvokeEvent<ReverificationResult>>((_, event) => ({
  retainedPreparation: null,
  methods: event.output.methods,
  activeMethod: event.output.startingMethod,
  inputValue: '',
  error: undefined,
  ...unlockResend(),
  direction: 1,
}));
const afterResult = [
  ...afterDrain,
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
    actions: applyResult,
  },
  { target: 'verifying' as const, actions: applyResult },
];

function topOverlay(ctx: ReverificationContext): Overlay | undefined {
  return ctx.overlay[ctx.overlay.length - 1];
}

const factorEvents = {
  TYPE: {
    actions: assign((_, event) => ({ inputValue: event.value, error: undefined })),
  },
  SHOW_METHODS: {
    guard: ctx =>
      ctx.overlay.length === 0 && ctx.methods.filter(method => method.id !== ctx.activeMethod?.id).length > 0,
    actions: assign(ctx => ({
      overlay: ['method-picker' as const],
      direction: 1 as const,
      submitRequested: false,
      frozenActiveMethodId: ctx.activeMethod?.id,
    })),
  },
  SHOW_HELP: {
    guard: ctx => topOverlay(ctx) !== 'help',
    actions: assign(ctx => ({
      overlay: [...ctx.overlay, 'help' as const],
      direction: 1 as const,
      submitRequested: false,
    })),
  },
  BACK: {
    guard: ctx => ctx.overlay.length > 0,
    actions: assign(ctx => ({ overlay: ctx.overlay.slice(0, -1), direction: -1 as const })),
  },
  SELECT_METHOD: ({ context: ctx, event }) => {
    if (topOverlay(ctx) !== 'method-picker') {
      return;
    }
    const method = ctx.methods.find(candidate => candidate.id === event.id);
    if (!method) {
      return;
    }
    const retained = ctx.retainedPreparation;
    const reusable = retained && sameMethod(method, retained.method) && retained.expiresAt > Date.now();
    const prepare = needsPrepare(method) && !reusable;
    return {
      target: prepare ? 'preparing' : 'verifying',
      context: {
        ...selectMethod(ctx, event.id),
        overlay: prepare ? ctx.overlay : [],
        resendAvailableAt: reusable ? retained.resendAvailableAt : ctx.resendAvailableAt,
      },
    };
  },
  RESET: 'inactive',
  START: { target: 'starting', actions: bindRun },
} satisfies NonNullable<StateConfig<ReverificationContext, ReverificationEvent>['on']>;

export const reverificationMachine = createMachine({
  id: 'reverification',
  initial: 'inactive',
  context: {
    scope: null,
    requestedScope: null,
    operationScope: null,
    retainedPreparation: null,
    preparation: null,
    inputValue: '',
    error: undefined,
    direction: 1,
    activeMethod: null,
    methods: [],
    resendAvailableAt: undefined,
    submitRequested: false,
    frozenActiveMethodId: undefined,
    overlay: [],
    supportEmail: '',
    deps: unseatedDeps,
  },
  states: {
    inactive: {
      entry: assign(() => ({ ...clearRun(), preparation: null, operationScope: null })),
      on: { START: { target: 'starting', actions: bindRun } },
    },

    starting: {
      entry: assign(ctx => ({ operationScope: ctx.scope })),
      on: drainingEvents,
      invoke: fromPromise(ctx => ctx.deps.start(), {
        onDone: afterResult,
        onError: [...afterDrain, { target: 'failed' }],
      }),
    },

    preparing: {
      entry: assign(ctx => ({ ...beginPreparation(ctx), operationScope: ctx.scope })),
      on: {
        ...factorEvents,
        ...drainingEvents,
        SELECT_METHOD: {
          guard: (ctx, event) =>
            topOverlay(ctx) === 'method-picker' && ctx.methods.some(method => method.id === event.id),
          actions: assign((ctx, event) => {
            const selection = selectMethod(ctx, event.id);
            const sending = selection.activeMethod && needsPrepare(selection.activeMethod);
            return {
              ...selection,
              overlay: sending ? ctx.overlay : [],
              preparation: ctx.preparation ? { ...ctx.preparation, presentation: sending ? 'picker' : 'factor' } : null,
            };
          }),
        },
        SUBMIT: {
          guard: ctx => ctx.overlay.length === 0,
          actions: assign(() => ({ submitRequested: true })),
        },
      },
      invoke: fromPromise(prepareActive, {
        onDone: ({ context, event }) => settlePreparation(context, { status: 'sent', verification: event.output }),
        onError: ({ context, event }) => settlePreparation(context, { status: 'failed', error: event.error }),
      }),
    },

    verifying: {
      always: [{ guard: ctx => ctx.activeMethod === null, target: 'unavailable' }],
      on: {
        ...factorEvents,
        SUBMIT: { target: 'submitting', guard: ctx => ctx.overlay.length === 0 },
        RESEND: {
          target: 'preparing',
          guard: ctx =>
            ctx.overlay.length === 0 &&
            Boolean(ctx.activeMethod && needsPrepare(ctx.activeMethod)) &&
            (ctx.resendAvailableAt === undefined || Date.now() >= ctx.resendAvailableAt),
          actions: assign(() => ({
            inputValue: '',
            error: undefined,
            submitRequested: false,
          })),
        },
      },
    },

    submitting: {
      entry: assign(ctx => ({
        operationScope: ctx.scope,
        retainedPreparation:
          ctx.activeMethod?.strategy === 'totp' || ctx.activeMethod?.strategy === 'backup_code'
            ? ctx.retainedPreparation
            : null,
      })),
      on: drainingEvents,
      invoke: fromPromise(submit, {
        onDone: afterResult,
        onError: [
          ...afterDrain,
          {
            guard: (_: ReverificationContext, event: ErrorInvokeEvent) => isPasskeyAbortedError(event.error),
            target: 'verifying',
            actions: assign(() => ({ error: undefined })),
          },
          {
            target: 'verifying',
            actions: assign((_, event) => ({ error: toLocalizableError(event.error) })),
          },
        ],
      }),
    },

    unavailable: {
      on: { RESET: 'inactive', START: { target: 'starting', actions: bindRun } },
    },

    failed: {
      on: { RESET: 'inactive', START: { target: 'starting', actions: bindRun } },
    },

    finishing: {
      entry: assign(ctx => ({ retainedPreparation: null, operationScope: ctx.scope })),
      on: drainingEvents,
      invoke: fromPromise(ctx => ctx.deps.finish(), {
        onDone: [...afterDrain, { target: 'retrying' }],
        onError: [...afterDrain, { target: 'failed' }],
      }),
    },

    // This means we are retrying the action after successful reverification
    // This state is left by the model returning to inactive once the retry has completed
    retrying: {
      on: { RESET: 'inactive', START: { target: 'starting', actions: bindRun } },
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

function viewStep(
  value: string,
  overlay: Overlay | undefined,
  method: ReverificationMethod | null,
): ReverificationStep | undefined {
  if (overlay) {
    return overlay;
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
 *
 * When the run ends or the user cancels, the model returns to inactive and the controller to
 * 'idle' in the same render. Continuity of the card on screen is the `Reverification` component's
 * job: it keeps rendering the last card it showed, pending and without `onCancel`, for as long as
 * it stays mounted, so a host can animate the card away without it going blank.
 */
export function useReverificationController(model: ReverificationModel): ReverificationController {
  const state = useReverificationState(model);
  return useMemo(
    () => ({ ...state, visible: state.status === 'ready' || state.status === 'retrying' || state.status === 'error' }),
    [state],
  );
}

function useReverificationState(model: ReverificationModel): ReverificationControllerState {
  const m = useMessages('reverification');
  const errorText = useErrorText();
  const active = model.status === 'active' ? model : null;

  const [snapshot, send] = useMachine(
    reverificationMachine,
    active
      ? {
          context: {
            requestedScope: active.scope,
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
  const onCancel = cancelModel;
  const needsStart = active !== null && !sameScope(active.scope, snapshot.context.scope);
  const needsReset = model.status === 'inactive' && snapshot.context.scope !== null;
  /* eslint-disable react-you-might-not-need-an-effect/no-event-handler -- Syncs the machine with the model status, which changes outside this component. */
  useEffect(() => {
    if (needsStart) {
      send({ type: 'START' });
    } else if (needsReset) {
      send({ type: 'RESET' });
    }
  }, [needsStart, needsReset, send]);
  /* eslint-enable react-you-might-not-need-an-effect/no-event-handler */

  const inactive = model.status === 'inactive';

  return useMemo((): ReverificationControllerState => {
    if (inactive) {
      return { status: 'idle' };
    }

    const { context } = snapshot;
    const activeMethod = context.activeMethod;
    const state = snapshot.value;

    if (state === 'unavailable') {
      return { status: 'error', reason: 'noFactors', onCancel };
    }

    if (state === 'failed') {
      return { status: 'error', reason: 'generic', onCancel };
    }

    const step = viewStep(state, topOverlay(context), activeMethod);

    if (!step) {
      return { status: 'loading', onCancel };
    }

    // If we are currently on the alternative methods screen and preparing a factor, activeMethod will
    // have transitioned to the factor we are now preparing, so the one we want to hide is the old one
    const excludeId =
      state === 'preparing' && context.preparation?.presentation === 'picker'
        ? context.frozenActiveMethodId
        : activeMethod?.id;
    const methods = context.methods.filter(method => method.id !== excludeId);
    const pendingMethodId =
      state === 'preparing' && context.preparation?.presentation === 'picker' ? activeMethod?.id : undefined;

    const view: ReverificationViewProps = {
      step,
      direction: context.direction,
      value: context.inputValue,
      onValueChange: (value: string) => send({ type: 'TYPE', value }),
      errorMessage: context.error ? errorText(context.error, m.attemptFailed) : undefined,
      isPending: pendingStates.has(state),
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

    return state === 'retrying' ? { status: 'retrying', ...view } : { status: 'ready', onCancel, ...view };
  }, [inactive, snapshot, onCancel, send, m, errorText, canResend, countingDown, resendAvailableAt, now]);
}
