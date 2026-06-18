import { assign } from '../machine/assign';
import { createMachine } from '../machine/createMachine';
import type { ErrorInvokeEvent, StateMachine } from '../machine/types';

export interface DeleteOrgContext {
  error: string | null;
}

export type DeleteOrgEvent = { type: 'OPEN' } | { type: 'CONFIRM' } | { type: 'CANCEL' };

export function createDeleteOrgMachine(destroyFn: () => Promise<void>): StateMachine<DeleteOrgContext, DeleteOrgEvent> {
  return createMachine<DeleteOrgContext, DeleteOrgEvent>({
    id: 'deleteOrg',
    initial: 'idle',
    context: { error: null },
    states: {
      idle: { on: { OPEN: 'confirming' } },
      confirming: {
        on: {
          CONFIRM: 'deleting',
          CANCEL: {
            target: 'idle',
            actions: assign<DeleteOrgContext, DeleteOrgEvent>(() => ({ error: null })),
          },
        },
      },
      deleting: {
        invoke: {
          src: destroyFn,
          onDone: 'deleted',
          onError: {
            target: 'confirming',
            actions: assign<DeleteOrgContext, ErrorInvokeEvent>((_, event) => ({
              error: String(event.error),
            })),
          },
        },
      },
      deleted: { type: 'final' },
    },
  });
}
