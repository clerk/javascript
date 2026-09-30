import { isClerkAPIResponseError } from '@clerk/shared/error';

import { setup } from '../../machine/setup';
import type { ErrorInvokeEvent, StateMachine } from '../../machine/types';
import type { ReverificationContext, ReverificationEvent } from './reverification.machine';

export type ReverifiedActionActors = {
  action: () => Promise<unknown>;
  reverification: StateMachine<ReverificationContext, ReverificationEvent>;
};

export interface ReverifiedActionContext {
  error: unknown;
}

export type ReverifiedActionEvent = { type: 'SESSION_CHANGED' };

const { createMachine, assign } = setup<ReverifiedActionContext, ReverifiedActionEvent, ReverifiedActionActors>();

function isReverificationRequired(error: unknown): boolean {
  return isClerkAPIResponseError(error) && error.errors.some(({ code }) => code === 'session_reverification_required');
}

const fail = {
  target: '#reverifiedAction.failed',
  actions: assign<ErrorInvokeEvent>((_, event) => ({ error: event.error })),
};

export const reverifiedActionMachine = createMachine({
  id: 'reverifiedAction',
  initial: 'running',
  context: { error: undefined },
  states: {
    running: {
      invoke: {
        src: 'action',
        onDone: 'done',
        onError: [{ target: 'verifying', guard: (_, event) => isReverificationRequired(event.error) }, fail],
      },
    },
    verifying: {
      tags: ['interactive'],
      initial: 'challenge',
      invoke: { id: 'reverification', src: 'reverification', onDone: '.retrying' },
      states: {
        challenge: {
          tags: ['cancellable'],
          on: { SESSION_CHANGED: '#reverifiedAction.cancelled' },
        },
        retrying: {
          invoke: { src: 'action', onDone: '#reverifiedAction.done', onError: fail },
        },
      },
    },
    done: { type: 'final' },
    failed: { type: 'final', error: ctx => ctx.error },
    cancelled: { type: 'final' },
  },
});
