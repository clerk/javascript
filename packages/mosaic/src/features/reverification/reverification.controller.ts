import { isClerkRuntimeError } from '@clerk/shared/error';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import type { FlowDirection } from '../../components/flow';
import { useResendSeconds } from '../../hooks/use-resend-seconds';
import type { ErrorDescription } from '../../localization';
import { isLocalizableError, useErrorText, useMessages } from '../../localization';
import { createAsyncLogic, setup } from '../../machine/setup';
import type { DoneInvokeEvent, StateConfig, TransitionResult } from '../../machine/types';
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

const { createMachine } = setup<ReverificationContext, ReverificationEvent>();

type ReverificationState =
  | 'inactive'
  | 'starting'
  | 'preparing'
  | 'methodPickerPreparing'
  | 'verifying'
  | 'submitting'
  | 'unavailable'
  | 'failed'
  | 'finishing'
  | 'retrying';

function notSeated(): Promise<never> {
  return Promise.reject(new Error('reverification deps are not seated'));
}

const unseatedDeps: ReverificationDeps = {
  start: notSeated,
  prepare: notSeated,
  attempt: notSeated,
  finish: notSeated,
};

type Seated = ReverificationDeps & Pick<ReverificationActiveModel, 'supportEmail'>;

const unseated: Seated = { ...unseatedDeps, supportEmail: '' };

function latestDeps(seated: { current: ReverificationDeps }): ReverificationDeps {
  return {
    start: () => seated.current.start(),
    prepare: method => seated.current.prepare(method),
    attempt: (method, value) => seated.current.attempt(method, value),
    finish: () => seated.current.finish(),
  };
}

function reverificationActors(deps: ReverificationDeps) {
  return {
    start: createAsyncLogic<undefined, ReverificationResult>(() => deps.start()),
    prepare: createAsyncLogic<ReverificationMethod | null, void>(({ input }) =>
      input && needsPrepare(input) ? deps.prepare(input) : Promise.resolve(),
    ),
    attempt: createAsyncLogic<{ method: ReverificationMethod | null; value: string }, ReverificationResult>(
      ({ input }) =>
        input.method ? deps.attempt(input.method, input.value) : Promise.reject(new Error('No active method')),
    ),
    finish: createAsyncLogic<undefined, void>(() => deps.finish()),
  };
}

type ReverificationActors = ReturnType<typeof reverificationActors>;

type ReverificationOn = NonNullable<
  StateConfig<
    ReverificationContext,
    ReverificationEvent,
    ReverificationState,
    Record<never, never>,
    ReverificationActors
  >['on']
>;

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

function applyResult(output: ReverificationResult): Partial<ReverificationContext> {
  return {
    methods: output.methods,
    activeMethod: output.startingMethod,
    inputValue: '',
    errors: [],
    ...unlockResend(),
    direction: 1,
  };
}

function afterResult({
  event,
}: {
  event: DoneInvokeEvent<ReverificationResult>;
}): TransitionResult<ReverificationContext, ReverificationState> {
  const { output } = event;
  if (output.status === 'complete') {
    // We don't apply the result here as we want to keep the old one visible as we are finishing
    return { target: 'finishing' };
  }
  const method = output.startingMethod;
  if (method === null) {
    return { target: 'unavailable', context: applyResult(output) };
  }
  if (needsPrepare(method)) {
    return { target: 'preparing', context: { ...applyResult(output), ...lockResend() } };
  }
  return { target: 'verifying', context: applyResult(output) };
}

function topOverlay(ctx: ReverificationContext): Overlay | undefined {
  return ctx.overlay[ctx.overlay.length - 1];
}

const factorEvents = {
  TYPE: ({ event }) => ({ context: { inputValue: event.value, errors: [] } }),
  SHOW_METHODS: ({ context }) =>
    context.overlay.length === 0 && context.methods.filter(method => method.id !== context.activeMethod?.id).length > 0
      ? {
          context: {
            overlay: ['method-picker'],
            direction: 1,
            submitRequested: false,
            frozenActiveMethodId: context.activeMethod?.id,
          },
        }
      : undefined,
  SHOW_HELP: ({ context }) =>
    topOverlay(context) !== 'help'
      ? { context: { overlay: [...context.overlay, 'help'], direction: 1, submitRequested: false } }
      : undefined,
  BACK: ({ context }) =>
    context.overlay.length > 0 ? { context: { overlay: context.overlay.slice(0, -1), direction: -1 } } : undefined,
  SELECT_METHOD: ({ context, event }) => {
    if (topOverlay(context) !== 'method-picker') {
      return undefined;
    }
    const method = context.methods.find(candidate => candidate.id === event.id);
    if (method && needsPrepare(method)) {
      return { target: 'methodPickerPreparing', context: selectMethod(context, event.id) };
    }
    return { target: 'verifying', context: { ...selectMethod(context, event.id), overlay: [] } };
  },
  RESET: { target: 'inactive' },
} satisfies ReverificationOn;

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
  },
  actors: reverificationActors(unseatedDeps),
  states: {
    inactive: {
      entry: () => ({
        context: {
          inputValue: '',
          errors: [],
          submitRequested: false,
          overlay: [],
          ...unlockResend(),
        },
      }),
      on: { START: { target: 'starting' } },
    },

    starting: {
      on: { RESET: { target: 'inactive' } },
      invoke: {
        src: 'start',
        onDone: afterResult,
        onError: { target: 'failed' },
      },
    },

    /*
      Preparing a factor behind the scenes (e.g. sending an OTP)

      This shows the factor card with optimistic UI, so it needs to handle the same actions
      as verifying, but if the user submits, we queue that up until after prepare resolves
    */
    preparing: {
      on: {
        ...factorEvents,
        SUBMIT: ({ context }) => (context.overlay.length === 0 ? { context: { submitRequested: true } } : undefined),
      },
      invoke: {
        src: 'prepare',
        input: ({ context }) => context.activeMethod,
        onDone: ({ context }) =>
          context.submitRequested
            ? { target: 'submitting', context: { submitRequested: false } }
            : { target: 'verifying' },
        onError: ({ event }) => ({
          target: 'verifying',
          context: {
            errors: toLocalizableErrors(event.error),
            submitRequested: false,
            ...unlockResend(),
          },
        }),
      },
    },

    /*
      When selecting a method from the picker, we prepare before going to the factor card

      We don't use optimistic UI here simply because we're in a better position to show
      some feedback that does not feel janky. The view handles disabling inputs while preparing.
    */
    methodPickerPreparing: {
      entry: () => ({ context: lockResend() }),
      on: { RESET: { target: 'inactive' } },
      invoke: {
        src: 'prepare',
        input: ({ context }) => context.activeMethod,
        onDone: (): TransitionResult<ReverificationContext, ReverificationState> => ({
          target: 'verifying',
          context: { overlay: [] },
        }),
        onError: ({ event }) => ({
          target: 'verifying',
          context: { errors: toLocalizableErrors(event.error), overlay: [], ...unlockResend() },
        }),
      },
    },

    verifying: {
      always: ({ context }) => (context.activeMethod === null ? { target: 'unavailable' } : undefined),
      on: {
        ...factorEvents,
        SUBMIT: ({ context }) => (context.overlay.length === 0 ? { target: 'submitting' } : undefined),
        RESEND: ({ context }) =>
          context.overlay.length === 0 &&
          context.activeMethod &&
          needsPrepare(context.activeMethod) &&
          isResendUnlocked(context.resendAvailableAt)
            ? {
                target: 'preparing',
                context: {
                  ...lockResend(),
                  inputValue: '',
                  errors: [],
                  submitRequested: false,
                },
              }
            : undefined,
      },
    },

    submitting: {
      on: { RESET: { target: 'inactive' } },
      invoke: {
        src: 'attempt',
        input: ({ context }) => ({ method: context.activeMethod, value: context.inputValue }),
        onDone: afterResult,
        onError: ({ event }) => ({
          target: 'verifying',
          context: { errors: isPasskeyAbortedError(event.error) ? [] : toLocalizableErrors(event.error) },
        }),
      },
    },

    unavailable: {
      on: { RESET: { target: 'inactive' } },
    },

    failed: {
      on: { RESET: { target: 'inactive' } },
    },

    finishing: {
      on: { RESET: { target: 'inactive' } },
      invoke: {
        src: 'finish',
        onDone: { target: 'retrying' },
        onError: { target: 'failed' },
      },
    },

    // This means we are retrying the action after successful reverification
    // This state is left by the model returning to inactive once the retry has completed
    retrying: {
      on: { RESET: { target: 'inactive' } },
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

  const seated = useRef<Seated>(unseated);
  useLayoutEffect(() => {
    if (active) {
      seated.current = active;
    }
  });
  const [snapshot, send] = useMachine(
    // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
    reverificationMachine.provide({ actors: reverificationActors(latestDeps(seated)) }),
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
        const supportEmail = seated.current.supportEmail;
        if (supportEmail) {
          window.location.assign(`mailto:${supportEmail}`);
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
