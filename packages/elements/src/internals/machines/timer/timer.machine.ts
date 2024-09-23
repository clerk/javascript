import { assign, emit, setup } from 'xstate';

const DEFAULT_INITIAL = 30;

export const TimerDelays = {
  timeout: 1_000, // 1 second
} as const;

export type TimerDelays = keyof typeof TimerDelays;

export type TimerEvents =
  | { type: 'RESET'; initial?: number; timeout?: number }
  | { type: 'START'; initial?: number; timeout?: number }
  | { type: 'STOP' }
  | { type: 'TOGGLE' };

export interface TimerSchema {
  context: {
    initial: number;
    remaining: number;
    timeout: number;
  };
  input?: {
    initial?: number;
    timeout?: number;
  };
  delays: {
    timeout: number;
  };
  events: TimerEvents;
  emitted: { type: 'complete' } | { type: 'tick'; remaining: number };
  tags: 'idle' | 'running' | 'incomplete' | 'complete';
}

export const TimerMachine = setup({
  actions: {
    decrement: assign(({ context }) => ({ remaining: context.remaining - 1 })),
    reset: assign(({ context }, params: { initial?: number; timeout?: number }) => ({
      initial: params.initial || context.initial,
      remaining: params.initial || context.initial,
      timeout: params.timeout || context.timeout,
    })),
    emitComplete: emit({ type: 'complete' as const }),
    emitTick: emit(({ context }) => ({ type: 'tick' as const, remaining: context.remaining })),
  },
  delays: {
    timeout: ({ context }) => context.timeout,
  },
  guards: {
    isComplete: ({ context }) => context.remaining <= 0,
  },
  types: {} as TimerSchema,
}).createMachine({
  id: 'timer',
  context: ({ input }) => {
    const initial = input.initial ?? DEFAULT_INITIAL;

    return {
      initial,
      remaining: initial,
      timeout: input.timeout || TimerDelays.timeout,
    };
  },
  on: {
    RESET: {
      actions: {
        type: 'reset',
        params: ({ event }) => {
          const initial = event.initial ?? DEFAULT_INITIAL;
          return {
            initial,
            remaining: initial,
            timeout: event.timeout || TimerDelays.timeout,
          };
        },
      },
    },
  },
  initial: 'Idle',
  states: {
    Idle: {
      tags: ['idle'],
      on: {
        START: 'Running',
        TOGGLE: 'Running',
      },
    },
    Running: {
      tags: ['incomplete', 'running'],
      on: {
        STOP: 'Idle',
        TOGGLE: 'Idle',
      },
      after: {
        timeout: [
          {
            guard: 'isComplete',
            target: 'Complete',
          },
          {
            actions: ['decrement', 'emitTick'],
          },
        ],
      },
    },
    Complete: {
      tags: ['complete'],
      entry: 'emitComplete',
      type: 'final',
    },
  },
});
