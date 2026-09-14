import { useEffect, useState } from 'react';

import type { FlowDirection } from '../../components/flow';
import { setup } from '../../machine/setup';
import type { DoneInvokeEvent, StateConfig } from '../../machine/types';
import { useMachine } from '../../machine/useMachine';
import type { ReverificationModel, ReverificationReadyModel } from './reverification.model';
import type { ReverificationMethod, ReverificationResult, ReverificationViewProps } from './reverification.types';
import { needsPrepare, otpChannelFor } from './reverification.utils';

export type ReverificationController =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'unavailable' }
  | ({ status: 'ready' } & ReverificationViewProps);

type OverlayFrom = 'factor' | 'method-picker';

export type ReverificationDeps = Pick<ReverificationReadyModel, 'start' | 'prepare' | 'attempt' | 'finish' | 'cancel'>;

interface ReverificationContext {
  inputValue: string;
  errorMessage: string | undefined;
  direction: FlowDirection;
  activeMethod: ReverificationMethod | null;
  methods: readonly ReverificationMethod[];
  resendAvailableAt: number | undefined;
  abortRequested: boolean;
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
  cancel: () => {},
};

export const RESEND_COOLDOWN_MS = 30_000;

function lockResend(): Pick<ReverificationContext, 'resendAvailableAt'> {
  return { resendAvailableAt: Date.now() + RESEND_COOLDOWN_MS };
}

function unlockResend(): Pick<ReverificationContext, 'resendAvailableAt'> {
  return { resendAvailableAt: undefined };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function selectMethod(ctx: ReverificationContext, id: string): Partial<ReverificationContext> {
  return {
    activeMethod: ctx.methods.find(method => method.id === id) ?? ctx.activeMethod,
    inputValue: '',
    errorMessage: undefined,
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
  errorMessage: undefined,
  ...unlockResend(),
  direction: 1,
}));
const afterResult = [
  {
    guard: (_: ReverificationContext, event: DoneInvokeEvent<ReverificationResult>) =>
      event.output.status === 'complete',
    target: 'completing' as const,
    // We don't apply the result here as we want to keep the old one visible as we are completing
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

const abortAfterInvoke = {
  target: 'done' as const,
  guard: (ctx: ReverificationContext) => ctx.abortRequested,
  actions: [
    (ctx: ReverificationContext) => {
      ctx.deps.cancel();
    },
    assign(() => ({ abortRequested: false })),
  ],
};

const factorEvents = {
  TYPE: {
    actions: assign((_, event) => ({ inputValue: event.value, errorMessage: undefined })),
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
    errorMessage: undefined,
    direction: 1,
    activeMethod: null,
    methods: [],
    resendAvailableAt: undefined,
    abortRequested: false,
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
        errorMessage: undefined,
        abortRequested: false,
        submitRequested: false,
        ...unlockResend(),
      })),
      on: { START: 'starting' },
    },

    starting: {
      on: { RESET: 'inactive' },
      invoke: fromPromise(ctx => ctx.deps.start(), {
        onDone: afterResult,
        onError: 'unavailable',
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
            errorMessage: errorMessage(event.error),
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
          actions: assign((_, event) => ({ errorMessage: errorMessage(event.error), ...unlockResend() })),
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
            errorMessage: undefined,
            submitRequested: false,
          })),
        },
      },
    },

    submitting: {
      on: {
        RESET: {
          guard: ctx => !ctx.abortRequested,
          actions: assign(() => ({ abortRequested: true })),
        },
      },
      invoke: fromPromise(submit, {
        onDone: [abortAfterInvoke, ...afterResult],
        onError: [
          abortAfterInvoke,
          {
            target: 'verifying',
            actions: assign((_, event) => ({ errorMessage: errorMessage(event.error) })),
          },
        ],
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
      entry: (ctx: ReverificationContext) => {
        ctx.deps.cancel();
      },
      on: { RESET: 'inactive' },
    },

    completing: {
      on: { RESET: 'inactive' },
      invoke: fromPromise(ctx => ctx.deps.finish(), {
        onDone: 'done',
        onError: {
          target: 'verifying',
          actions: assign((_, event) => ({ errorMessage: errorMessage(event.error) })),
        },
      }),
    },

    done: {
      on: { RESET: 'inactive' },
    },
  },
});

const pendingStates = new Set(['submitting', 'completing']);

function viewStep(value: string, method: ReverificationMethod | null): ReverificationViewProps['step'] | undefined {
  if (value === 'methodPicker' || value === 'methodPickerPreparing') {
    return 'method-picker';
  }
  if (value === 'help') {
    return 'help';
  }
  if (value === 'verifying' || value === 'submitting' || value === 'preparing' || value === 'completing') {
    if (!method) {
      return undefined;
    }
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
  return undefined;
}

/**
 * Machine - State internal to the controller, not all steps are exposed to the UI
 * Return 'ReverificationController' - The view state
 *   - status: idle | loading | unavailable | ready
 *   - When ready
 *     - step: The visible reverification step
 *
 * Note that there are two loading states.
 *   - status: 'loading' - Full card spinner
 *   - status: 'ready' && isPending: true - Current action is pending, inline loading state
 */
export function useReverificationController(model: ReverificationModel): ReverificationController {
  const ready = model.status === 'ready' ? model : null;

  const [snapshot, send] = useMachine(
    reverificationMachine,
    ready
      ? {
          context: {
            supportEmail: ready.supportEmail,
            deps: ready,
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

  const needsStart = model.isActive && Boolean(ready) && snapshot.value === 'inactive';
  const needsReset = !model.isActive && snapshot.value !== 'inactive';
  useEffect(() => {
    if (needsStart) {
      send({ type: 'START' });
    } else if (needsReset) {
      send({ type: 'RESET' });
    }
  }, [needsStart, needsReset, send]);

  if (!model.isActive) {
    return { status: 'idle' };
  }

  if (snapshot.value === 'inactive' || snapshot.value === 'starting' || snapshot.value === 'done') {
    return { status: 'loading' };
  }

  if (snapshot.value === 'unavailable') {
    return { status: 'unavailable' };
  }

  const { context } = snapshot;
  const step = viewStep(snapshot.value, context.activeMethod);
  if (!step) {
    return { status: 'unavailable' };
  }

  const activeMethod = context.activeMethod;
  // If we are currently on the alternative methods screen and preparing a factor, activeMethod will
  // have transitioned to the factor we are now preparing, so the one we want to hide is the old one
  const excludeId = snapshot.value === 'methodPickerPreparing' ? context.frozenActiveMethodId : activeMethod?.id;
  const methods = context.methods.filter(method => method.id !== excludeId);
  const pendingMethodId = snapshot.value === 'methodPickerPreparing' ? activeMethod?.id : undefined;

  return {
    status: 'ready',
    step,
    direction: context.direction,
    value: context.inputValue,
    onValueChange: value => send({ type: 'TYPE', value }),
    errorMessage: context.errorMessage,
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
    onSelectMethod: id => send({ type: 'SELECT_METHOD', id }),
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
}
