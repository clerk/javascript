import type { SessionVerificationLevel } from '@clerk/shared/types';

import type { FlowDirection } from '../../components/flow';
import { stateIn } from '../../machine/guards';
import { setup } from '../../machine/setup';
import type { DoneInvokeEvent, ErrorInvokeEvent } from '../../machine/types';
import type {
  ReverificationMethod,
  ReverificationPreparableMethod,
  ReverificationResult,
} from './reverification.types';
import { needsPrepare } from './reverification.utils';

export const RESEND_COOLDOWN_MS = 30_000;

export type ReverificationActors = {
  startVerification: (level: SessionVerificationLevel | undefined) => Promise<ReverificationResult>;
  prepareFactor: (method: ReverificationPreparableMethod) => Promise<void>;
  attemptFactor: (input: { method: ReverificationMethod; value: string }) => Promise<ReverificationResult>;
  finishVerification: () => Promise<void>;
};

export interface ReverificationContext {
  level: SessionVerificationLevel | undefined;
  methods: readonly ReverificationMethod[];
  activeMethod: ReverificationMethod | null;
  pendingMethod: ReverificationPreparableMethod | null;
  inputValue: string;
  errorMessage: string | undefined;
  direction: FlowDirection;
  resendAvailableAt: number | undefined;
}

export type ReverificationEvent =
  | { type: 'TYPE'; value: string }
  | { type: 'SUBMIT' }
  | { type: 'RESEND' }
  | { type: 'SHOW_METHODS' }
  | { type: 'SHOW_HELP' }
  | { type: 'SELECT_METHOD'; id: string }
  | { type: 'BACK' };

const { createMachine, assign } = setup<ReverificationContext, ReverificationEvent>();

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function canResend(ctx: ReverificationContext): boolean {
  return ctx.resendAvailableAt === undefined || Date.now() >= ctx.resendAvailableAt;
}

const lockResend = assign(() => ({ resendAvailableAt: Date.now() + RESEND_COOLDOWN_MS }));
const forward = assign(() => ({ direction: 1 as const }));
const backward = assign(() => ({ direction: -1 as const }));
const showError = assign<ErrorInvokeEvent>((_, event) => ({
  errorMessage: errorMessage(event.error),
  resendAvailableAt: undefined,
}));

const applyResult = assign<DoneInvokeEvent<ReverificationResult>>((_, event) => ({
  methods: event.output.methods,
  activeMethod: event.output.startingMethod,
  inputValue: '',
  errorMessage: undefined,
  resendAvailableAt: undefined,
  direction: 1,
}));

const activate = (method: ReverificationMethod | null) => ({
  activeMethod: method,
  pendingMethod: null,
  inputValue: '',
  errorMessage: undefined,
  direction: 1 as const,
});

const afterResult = [
  {
    target: '#reverification.finishing',
    guard: (_: ReverificationContext, event: DoneInvokeEvent<ReverificationResult>) =>
      event.output.status === 'complete',
  },
  {
    target: '#reverification.unavailable',
    guard: (_: ReverificationContext, event: DoneInvokeEvent<ReverificationResult>) =>
      event.output.startingMethod === null,
    actions: applyResult,
  },
  {
    target: '#factor.editing.preparing',
    guard: (_: ReverificationContext, event: DoneInvokeEvent<ReverificationResult>) => {
      const method = event.output.startingMethod;
      return method !== null && needsPrepare(method);
    },
    actions: [applyResult, lockResend],
  },
  { target: '#factor', actions: applyResult },
];

export const reverificationMachine = createMachine({
  id: 'reverification',
  initial: 'starting',
  context: {
    level: undefined,
    methods: [],
    activeMethod: null,
    pendingMethod: null,
    inputValue: '',
    errorMessage: undefined,
    direction: 1,
    resendAvailableAt: undefined,
  },
  states: {
    starting: {
      invoke: {
        src: 'startVerification',
        input: ctx => ctx.level,
        onDone: afterResult,
        onError: 'unavailable',
      },
    },

    factor: {
      id: 'factor',
      initial: 'editing',
      states: {
        editing: {
          initial: 'ready',
          on: {
            TYPE: { actions: assign((_, event) => ({ inputValue: event.value, errorMessage: undefined })) },
            SHOW_METHODS: {
              target: '#reverification.methods',
              guard: ctx => ctx.methods.some(method => method.id !== ctx.activeMethod?.id),
              actions: forward,
            },
            SHOW_HELP: { target: 'help', actions: forward },
          },
          states: {
            ready: {
              on: {
                SUBMIT: '#factor.submitting',
                RESEND: {
                  target: 'preparing',
                  guard: ctx => ctx.activeMethod !== null && needsPrepare(ctx.activeMethod) && canResend(ctx),
                  actions: [lockResend, assign(() => ({ inputValue: '', errorMessage: undefined }))],
                },
              },
            },
            preparing: {
              initial: 'idle',
              invoke: {
                src: 'prepareFactor',
                input: ctx => ctx.activeMethod,
                onDone: [
                  { target: '#factor.submitting', guard: stateIn('factor.editing.preparing.queued') },
                  { target: 'ready' },
                ],
                onError: { target: 'ready', actions: showError },
              },
              states: {
                idle: { on: { SUBMIT: 'queued' } },
                queued: {},
              },
            },
          },
        },
        submitting: {
          invoke: {
            src: 'attemptFactor',
            input: ctx => ({ method: ctx.activeMethod, value: ctx.inputValue }),
            onDone: afterResult,
            onError: { target: 'editing', actions: showError },
          },
        },
        help: {
          on: { BACK: { target: 'editing', actions: backward } },
        },
      },
    },

    methods: {
      initial: 'list',
      states: {
        list: {
          on: {
            SELECT_METHOD: ({ context, event }) => {
              const method = context.methods.find(candidate => candidate.id === event.id);
              if (method === undefined) {
                return undefined;
              }
              return needsPrepare(method)
                ? { target: 'preparing', context: { pendingMethod: method } }
                : { target: '#factor', context: activate(method) };
            },
            SHOW_HELP: { target: 'help', actions: forward },
            BACK: { target: '#factor', actions: backward },
          },
        },
        preparing: {
          entry: lockResend,
          invoke: {
            src: 'prepareFactor',
            input: ctx => ctx.pendingMethod,
            onDone: { target: '#factor', actions: assign(ctx => activate(ctx.pendingMethod)) },
            onError: {
              target: '#factor',
              actions: [assign(ctx => activate(ctx.pendingMethod)), showError],
            },
          },
        },
        help: {
          on: { BACK: { target: 'list', actions: backward } },
        },
      },
    },

    unavailable: {},

    finishing: {
      invoke: {
        src: 'finishVerification',
        onDone: 'verified',
        onError: { target: '#factor', actions: showError },
      },
    },

    verified: { type: 'final' },
  },
});
