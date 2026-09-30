import { childHasTag } from '../../machine/guards';
import { setup } from '../../machine/setup';
import type { AnyStateMachine, ErrorInvokeEvent } from '../../machine/types';

export interface DestructiveContext {
  errorMessage: string | undefined;
}

export type DestructiveEvent = { type: 'OPEN' } | { type: 'CLOSE' } | { type: 'CONFIRM' };

export type DestructiveActors = {
  action: (() => Promise<unknown>) | AnyStateMachine;
};

const { createMachine, assign } = setup<DestructiveContext, DestructiveEvent, DestructiveActors>();

export const destructiveMachine = createMachine({
  id: 'destructive',
  initial: 'closed',
  context: { errorMessage: undefined },
  states: {
    closed: {
      on: { OPEN: 'open' },
    },
    open: {
      initial: 'confirming',
      on: { CLOSE: 'closed' },
      states: {
        confirming: {
          on: { CONFIRM: 'running' },
        },
        running: {
          on: { CLOSE: [{ target: '#destructive.closed', guard: childHasTag('action', 'cancellable') }, {}] },
          invoke: {
            id: 'action',
            src: 'action',
            onDone: '#destructive.closed',
            onError: {
              target: 'failed',
              actions: assign<ErrorInvokeEvent>(() => ({ errorMessage: 'Something went wrong' })),
            },
          },
        },
        failed: {
          on: { CONFIRM: 'running' },
        },
      },
    },
  },
});
