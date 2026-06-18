import { assign } from '../machine/assign';
import { createMachine } from '../machine/createMachine';
import type { ErrorInvokeEvent } from '../machine/types';

export interface LeaveOrgContext {
  leaveFn: () => Promise<void>;
  error: string | null;
}

export type LeaveOrgEvent = { type: 'OPEN' } | { type: 'CONFIRM' } | { type: 'CANCEL' };

export const leaveOrgMachine = createMachine<LeaveOrgContext, LeaveOrgEvent>({
  id: 'leaveOrg',
  initial: 'idle',
  context: { leaveFn: async () => {}, error: null },
  states: {
    idle: { on: { OPEN: 'confirming' } },
    confirming: {
      on: {
        CONFIRM: 'leaving',
        CANCEL: {
          target: 'idle',
          actions: assign<LeaveOrgContext, LeaveOrgEvent>(() => ({ error: null })),
        },
      },
    },
    leaving: {
      invoke: {
        src: ctx => ctx.leaveFn(),
        onDone: 'left',
        onError: {
          target: 'confirming',
          actions: assign<LeaveOrgContext, ErrorInvokeEvent>((_, event) => ({
            error: String(event.error),
          })),
        },
      },
    },
    left: { type: 'final' },
  },
});
