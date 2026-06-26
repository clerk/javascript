import { setup } from '../machine/setup';

export interface LeaveOrgContext {
  organizationName: string;
  confirmationValue: string;
  leaveOrganization: () => Promise<void>;
  error: string | null;
}

export type LeaveOrgEvent =
  | { type: 'OPEN' }
  | { type: 'TYPE_CONFIRMATION'; value: string }
  | { type: 'CONFIRM' }
  | { type: 'CANCEL' };

const { createMachine, assign, fromPromise } = setup<LeaveOrgContext, LeaveOrgEvent>();

export const leaveOrgMachine = createMachine({
  id: 'leaveOrg',
  initial: 'idle',
  context: {
    organizationName: '',
    confirmationValue: '',
    leaveOrganization: async () => {},
    error: null,
  },
  states: {
    idle: { on: { OPEN: 'confirming' } },
    confirming: {
      on: {
        TYPE_CONFIRMATION: {
          actions: assign((_, event) => ({ confirmationValue: event.value, error: null })),
        },
        CONFIRM: {
          target: 'leaving',
          guard: context => context.confirmationValue === context.organizationName,
        },
        CANCEL: {
          target: 'idle',
          actions: assign(() => ({ confirmationValue: '', error: null })),
        },
      },
    },
    leaving: {
      invoke: fromPromise(ctx => ctx.leaveOrganization(), {
        onDone: 'left',
        onError: {
          target: 'confirming',
          actions: assign((_, event) => ({
            error: event.error instanceof Error ? event.error.message : 'Something went wrong. Please try again.',
          })),
        },
      }),
    },
    left: { type: 'final' },
  },
});
