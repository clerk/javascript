import { assign } from '../machine/assign';
import { createMachine } from '../machine/createMachine';
import type { ErrorInvokeEvent } from '../machine/types';

export interface DeleteOrgContext {
  destroyFn: () => Promise<void>;
  error: string | null;
}

export type DeleteOrgEvent = { type: 'OPEN' } | { type: 'CONFIRM' } | { type: 'CANCEL' };

export const deleteOrgMachine = createMachine<DeleteOrgContext, DeleteOrgEvent>({
  id: 'deleteOrg',
  initial: 'idle',
  context: { destroyFn: async () => {}, error: null },
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
        src: ctx => ctx.destroyFn(),
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
