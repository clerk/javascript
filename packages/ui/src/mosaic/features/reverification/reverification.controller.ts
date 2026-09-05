import { useEffect } from 'react';

import type { FlowDirection } from '../../components/flow';
import { setup } from '../../machine/setup';
import type { DoneInvokeEvent } from '../../machine/types';
import { useMachine } from '../../machine/useMachine';
import type { ReverificationModel } from './reverification.model';
import type { ReverificationMethod, ReverificationResult, ReverificationViewProps } from './reverification.types';
import { needsPrepare, otpChannelFor } from './reverification.utils';

export type ReverificationController =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'unavailable' }
  | ({ status: 'ready' } & ReverificationViewProps);

type OverlayFrom = 'factor' | 'method-picker';

export type ReverificationDeps = {
  start: () => Promise<ReverificationResult>;
  prepare: (method: ReverificationMethod, verificationStatus: ReverificationResult['status']) => Promise<void>;
  attempt: (
    method: ReverificationMethod,
    value: string,
    verificationStatus: ReverificationResult['status'],
  ) => Promise<ReverificationResult>;
  verifyPasskey: () => Promise<ReverificationResult>;
  finish: () => Promise<void>;
  cancel: () => void;
};

interface ReverificationContext {
  inputValue: string;
  errorMessage: string | undefined;
  direction: FlowDirection;
  activeMethod: ReverificationMethod | null;
  methods: readonly ReverificationMethod[];
  canResend: boolean;
  abortRequested: boolean;
  overlayFrom: OverlayFrom;
  supportEmail: string;
  verificationStatus: ReverificationResult['status'] | null;
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
  | { type: 'RESEND' }
  | { type: 'ABORT' };

const { createMachine, assign, fromPromise } = setup<ReverificationContext, ReverificationEvent>();

const unseatedDeps: ReverificationDeps = {
  start: () => Promise.reject(new Error('start is not seated')),
  prepare: () => Promise.resolve(),
  attempt: () => Promise.reject(new Error('attempt is not seated')),
  verifyPasskey: () => Promise.reject(new Error('verifyPasskey is not seated')),
  finish: () => Promise.resolve(),
  cancel: () => {},
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function selectMethod(ctx: ReverificationContext, id: string): Partial<ReverificationContext> {
  return {
    activeMethod: ctx.methods.find(method => method.id === id) ?? ctx.activeMethod,
    inputValue: '',
    errorMessage: undefined,
    direction: 1,
  };
}

function prepareActive(ctx: ReverificationContext) {
  return ctx.deps.prepare(
    ctx.activeMethod as ReverificationMethod,
    ctx.verificationStatus ?? 'needs_first_factor',
  );
}

function submit(ctx: ReverificationContext): Promise<ReverificationResult> {
  const method = ctx.activeMethod as ReverificationMethod;
  return method.strategy === 'passkey'
    ? ctx.deps.verifyPasskey()
    : ctx.deps.attempt(method, ctx.inputValue, ctx.verificationStatus ?? 'needs_first_factor');
}

const applyResult = assign<DoneInvokeEvent<ReverificationResult>>((_, event) => ({
  methods: event.output.methods,
  activeMethod: event.output.startingMethod,
  verificationStatus: event.output.status,
  inputValue: '',
  errorMessage: undefined,
  canResend: true,
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
      const strategy = event.output.startingMethod?.strategy;
      return Boolean(strategy && needsPrepare(strategy));
    },
    target: 'preparing' as const,
    actions: applyResult,
  },
  { target: 'verifying' as const, actions: applyResult },
];

const abortNow = {
  target: 'done' as const,
  actions: (ctx: ReverificationContext) => {
    ctx.deps.cancel();
  },
};

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

export const reverificationMachine = createMachine({
  id: 'reverification',
  initial: 'inactive',
  context: {
    inputValue: '',
    errorMessage: undefined,
    direction: 1,
    activeMethod: null,
    methods: [],
    canResend: true,
    abortRequested: false,
    overlayFrom: 'factor',
    supportEmail: '',
    verificationStatus: null,
    deps: unseatedDeps,
  },
  states: {
    inactive: {
      entry: assign(() => ({
        inputValue: '',
        errorMessage: undefined,
        abortRequested: false,
        canResend: true,
        verificationStatus: null,
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

    preparing: {
      on: { RESET: 'inactive', ABORT: abortNow },
      invoke: fromPromise(prepareActive, {
        onDone: 'verifying',
        onError: {
          target: 'verifying',
          actions: assign((_, event) => ({ errorMessage: errorMessage(event.error) })),
        },
      }),
    },

    verifying: {
      after: {
        30_000: { guard: ctx => !ctx.canResend, actions: assign(() => ({ canResend: true })) },
      },
      on: {
        TYPE: {
          actions: assign((_, event) => ({ inputValue: event.value, errorMessage: undefined })),
        },
        SUBMIT: 'submitting',
        RESEND: {
          target: 'resending',
          guard: ctx => Boolean(ctx.activeMethod && needsPrepare(ctx.activeMethod.strategy) && ctx.canResend),
        },
        SHOW_METHODS: {
          target: 'methodPicker',
          guard: ctx => ctx.methods.filter(method => method.id !== ctx.activeMethod?.id).length > 0,
          actions: assign(() => ({ direction: 1 as const, overlayFrom: 'factor' as const })),
        },
        SHOW_HELP: {
          target: 'help',
          actions: assign(() => ({ direction: 1 as const, overlayFrom: 'factor' as const })),
        },
        ABORT: abortNow,
        RESET: 'inactive',
      },
    },

    submitting: {
      on: {
        ABORT: { actions: assign(() => ({ abortRequested: true })) },
        RESET: { actions: assign(() => ({ abortRequested: true })) },
      },
      invoke: fromPromise(submit, {
        onDone: afterResult,
        onError: [
          abortAfterInvoke,
          {
            target: 'verifying',
            actions: assign((_, event) => ({ errorMessage: errorMessage(event.error) })),
          },
        ],
      }),
    },

    resending: {
      on: { RESET: 'inactive' },
      invoke: fromPromise(prepareActive, {
        onDone: {
          target: 'verifying',
          actions: assign(() => ({ canResend: false, inputValue: '', errorMessage: undefined })),
        },
        onError: {
          target: 'verifying',
          actions: assign((_, event) => ({ errorMessage: errorMessage(event.error) })),
        },
      }),
    },

    methodPicker: {
      on: {
        SELECT_METHOD: [
          {
            target: 'preparing',
            guard: (ctx, event) => {
              const method = ctx.methods.find(candidate => candidate.id === event.id);
              return Boolean(method && needsPrepare(method.strategy));
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
        ABORT: abortNow,
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
        ABORT: abortNow,
        RESET: 'inactive',
      },
    },

    unavailable: {
      on: { ABORT: abortNow, RESET: 'inactive' },
    },

    completing: {
      on: { RESET: 'inactive' },
      invoke: fromPromise(ctx => ctx.deps.finish(), {
        onDone: 'done',
        onError: 'done',
      }),
    },

    done: {
      on: { RESET: 'inactive' },
    },
  },
});

const pendingStates = new Set(['starting', 'preparing', 'submitting', 'resending', 'completing']);

function viewStep(value: string, method: ReverificationMethod | null): ReverificationViewProps['step'] | undefined {
  if (value === 'methodPicker') {
    return 'method-picker';
  }
  if (value === 'help') {
    return 'help';
  }
  if (
    value === 'verifying' ||
    value === 'submitting' ||
    value === 'preparing' ||
    value === 'resending' ||
    value === 'completing'
  ) {
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
            deps: {
              start: ready.start,
              prepare: ready.prepare,
              attempt: ready.attempt,
              verifyPasskey: ready.verifyPasskey,
              finish: ready.finish,
              cancel: ready.cancel,
            },
          },
        }
      : undefined,
  );

  useEffect(() => {
    if (model.isActive && ready && snapshot.value === 'inactive') {
      send({ type: 'START' });
    } else if (!model.isActive && snapshot.value !== 'inactive') {
      send({ type: 'RESET' });
    }
  });

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
  const alternativeMethods = context.methods.filter(method => method.id !== activeMethod?.id);

  return {
    status: 'ready',
    step,
    direction: context.direction,
    value: context.inputValue,
    onValueChange: value => send({ type: 'TYPE', value }),
    errorMessage: context.errorMessage,
    isPending: pendingStates.has(snapshot.value),
    onSubmit: () => send({ type: 'SUBMIT' }),
    onVerifyPasskey: () => send({ type: 'SUBMIT' }),
    onShowMethods: alternativeMethods.length > 0 ? () => send({ type: 'SHOW_METHODS' }) : undefined,
    onShowHelp: () => send({ type: 'SHOW_HELP' }),
    onBack: step === 'method-picker' || step === 'help' ? () => send({ type: 'BACK' }) : undefined,
    onEmailSupport: () => {
      if (context.supportEmail) {
        window.location.assign(`mailto:${context.supportEmail}`);
      }
    },
    methods: alternativeMethods,
    onSelectMethod: id => send({ type: 'SELECT_METHOD', id }),
    otpChannel: activeMethod ? otpChannelFor(activeMethod.strategy) : undefined,
    identifier: activeMethod?.identifier,
    onResend:
      activeMethod && needsPrepare(activeMethod.strategy) && context.canResend
        ? () => send({ type: 'RESEND' })
        : undefined,
    canResend: context.canResend,
  };
}
