import { isClerkRuntimeError } from '@clerk/shared/error';
import { useEffect, useMemo } from 'react';

import type { FlowDirection } from '../../components/flow';
import { useResendSeconds } from '../../hooks/use-resend-seconds';
import type { ErrorDescription } from '../../localization';
import { isLocalizableError, useErrorText, useMessages } from '../../localization';
import { setup } from '../../machine/setup';
import type { DoneInvokeEvent, ErrorInvokeEvent, StateConfig } from '../../machine/types';
import { useMachine } from '../../machine/use-machine';
import { toLocalizableErrors } from '../../utils/errors';
import { CODE_RESEND_SECONDS, isResendUnlocked, resendUnlockTime } from '../../utils/verification';
import type { ReverificationActiveModel, ReverificationModel } from './reverification.model';
import type {
  ReverificationErrorReason,
  ReverificationMethod,
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

interface ReverificationContext {
  inputValue: string;
  errors: ErrorDescription[];
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

function lockResend(): Pick<ReverificationContext, 'resendAvailableAt'> {
  return { resendAvailableAt: resendUnlockTime(CODE_RESEND_SECONDS) };
}

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
    errors: [],
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
  errors: [],
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

function topOverlay(ctx: ReverificationContext): Overlay | undefined {
  return ctx.overlay[ctx.overlay.length - 1];
}

const factorEvents = {
  TYPE: {
    actions: assign((_, event) => ({ inputValue: event.value, errors: [] })),
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
  SELECT_METHOD: [
    {
      target: 'methodPickerPreparing' as const,
      guard: (ctx, event) => {
        const method = ctx.methods.find(candidate => candidate.id === event.id);
        return topOverlay(ctx) === 'method-picker' && Boolean(method && needsPrepare(method));
      },
      actions: assign((ctx, event) => selectMethod(ctx, event.id)),
    },
    {
      target: 'verifying' as const,
      guard: ctx => topOverlay(ctx) === 'method-picker',
      actions: assign((ctx, event) => ({ ...selectMethod(ctx, event.id), overlay: [] })),
    },
  ],
  RESET: 'inactive' as const,
} satisfies NonNullable<StateConfig<ReverificationContext, ReverificationEvent>['on']>;

export const reverificationMachine = createMachine({
  id: 'reverification',
  initial: 'inactive',
  context: {
    inputValue: '',
    errors: [],
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
      entry: assign(() => ({
        inputValue: '',
        errors: [],
        submitRequested: false,
        overlay: [],
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
          guard: ctx => ctx.overlay.length === 0,
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
            errors: toLocalizableErrors(event.error),
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
        onDone: { target: 'verifying', actions: assign(() => ({ overlay: [] })) },
        onError: {
          target: 'verifying',
          actions: assign((_, event) => ({ errors: toLocalizableErrors(event.error), overlay: [], ...unlockResend() })),
        },
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
            isResendUnlocked(ctx.resendAvailableAt),
          actions: assign(() => ({
            ...lockResend(),
            inputValue: '',
            errors: [],
            submitRequested: false,
          })),
        },
      },
    },

    submitting: {
      on: { RESET: 'inactive' },
      invoke: fromPromise(submit, {
        onDone: afterResult,
        onError: [
          {
            guard: (_: ReverificationContext, event: ErrorInvokeEvent) => isPasskeyAbortedError(event.error),
            target: 'verifying',
            actions: assign(() => ({ errors: [] })),
          },
          {
            target: 'verifying',
            actions: assign((_, event) => ({ errors: toLocalizableErrors(event.error) })),
          },
        ],
      }),
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
    // This state is left by the model returning to inactive once the retry has completed
    retrying: {
      on: { RESET: 'inactive' },
    },
  },
});

const pendingStates = new Set(['submitting', 'finishing', 'retrying']);

const fieldParameter = {
  password: 'password',
  passkey: undefined,
  email_code: 'code',
  phone_code: 'code',
  totp: 'code',
  backup_code: 'code',
} as const satisfies Record<ReverificationMethod['strategy'], string | undefined>;

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
            supportEmail: active.supportEmail,
            deps: active,
          },
        }
      : undefined,
  );

  const resendSeconds = useResendSeconds(snapshot.context.resendAvailableAt, CODE_RESEND_SECONDS);

  const cancelModel =
    (model.status === 'loading' || model.status === 'active') && snapshot.value !== 'retrying'
      ? model.cancel
      : undefined;
  const onCancel = cancelModel;
  const needsStart = active !== null && snapshot.value === 'inactive';
  const needsReset = model.status === 'inactive' && snapshot.value !== 'inactive';
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
    const excludeId = state === 'methodPickerPreparing' ? context.frozenActiveMethodId : activeMethod?.id;
    const methods = context.methods.filter(method => method.id !== excludeId);
    const pendingMethodId = state === 'methodPickerPreparing' ? activeMethod?.id : undefined;

    const fieldParam = activeMethod && fieldParameter[activeMethod.strategy];
    const fieldMessages: string[] = [];
    const globalMessages: string[] = [];
    for (const error of context.errors) {
      const messages =
        isLocalizableError(error) && fieldParam && error.paramName === fieldParam ? fieldMessages : globalMessages;
      messages.push(errorText(error, m.attemptFailed));
    }

    const view: ReverificationViewProps = {
      step,
      direction: context.direction,
      value: context.inputValue,
      onValueChange: (value: string) => send({ type: 'TYPE', value }),
      errorMessage: fieldMessages.join(' ') || undefined,
      globalErrorMessage: globalMessages.join(' ') || undefined,
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
      canResend: resendSeconds === 0,
      resendRemainingSeconds: resendSeconds > 0 ? resendSeconds : undefined,
    };

    return state === 'retrying' ? { status: 'retrying', ...view } : { status: 'ready', onCancel, ...view };
  }, [inactive, snapshot, onCancel, send, m, errorText, resendSeconds]);
}
