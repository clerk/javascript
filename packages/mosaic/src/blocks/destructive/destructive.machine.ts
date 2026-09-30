import { isClerkAPIResponseError } from '@clerk/shared/error';

import { setup } from '../../machine/setup';
import type { ErrorInvokeEvent } from '../../machine/types';

export interface DestructiveContext {
  errorMessage: string | undefined;
  reverifiable: boolean;
}

export type DestructiveEvent = { type: 'OPEN' } | { type: 'CLOSE' } | { type: 'CONFIRM' } | { type: 'SESSION_CHANGED' };

const { createMachine, assign } = setup<DestructiveContext, DestructiveEvent>();

export function isReverificationRequired(error: unknown): boolean {
  return isClerkAPIResponseError(error) && error.errors.some(({ code }) => code === 'session_reverification_required');
}

const fail = {
  target: '#destructive.open.failed',
  actions: assign<ErrorInvokeEvent>(() => ({ errorMessage: 'Something went wrong' })),
};

export const destructiveMachine = createMachine({
  id: 'destructive',
  initial: 'closed',
  context: { errorMessage: undefined, reverifiable: false },
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
          on: { CLOSE: {} },
          invoke: {
            src: 'action',
            onDone: '#destructive.closed',
            onError: [
              { target: 'verifying', guard: (ctx, event) => ctx.reverifiable && isReverificationRequired(event.error) },
              fail,
            ],
          },
        },
        verifying: {
          initial: 'challenge',
          invoke: { id: 'reverification', src: 'reverification', onDone: '.retrying' },
          states: {
            challenge: {
              on: { SESSION_CHANGED: '#destructive.closed' },
            },
            retrying: {
              on: { CLOSE: {} },
              invoke: { src: 'action', onDone: '#destructive.closed', onError: fail },
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
