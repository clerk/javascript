import { assign } from '../machine/assign';
import { createMachine } from '../machine/createMachine';
import type { ErrorInvokeEvent, StateMachine } from '../machine/types';

export interface LeaveOrgContext {
  error: string | null;
}

export type LeaveOrgEvent = { type: 'OPEN' } | { type: 'CONFIRM' } | { type: 'CANCEL' };

export function createLeaveOrgMachine(leaveFn: () => Promise<void>): StateMachine<LeaveOrgContext, LeaveOrgEvent> {
  return createMachine<LeaveOrgContext, LeaveOrgEvent>({
    id: 'leaveOrg',
    initial: 'idle',
    context: { error: null },
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
          src: leaveFn,
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
}
