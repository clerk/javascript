import { setup } from '../machine/setup';

export interface DeleteOrgContext {
  organizationName: string;
  confirmationValue: string;
  destroyOrganization: () => Promise<void>;
  error: string | null;
}

export type DeleteOrgEvent =
  | { type: 'OPEN' }
  | { type: 'TYPE_CONFIRMATION'; value: string }
  | { type: 'CONFIRM' }
  | { type: 'CANCEL' };

const { createMachine, assign, fromPromise } = setup<DeleteOrgContext, DeleteOrgEvent>();

export const deleteOrgMachine = createMachine({
  id: 'deleteOrg',
  initial: 'idle',
  context: {
    organizationName: '',
    confirmationValue: '',
    destroyOrganization: async () => {},
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
          target: 'deleting',
          guard: context => context.confirmationValue === context.organizationName,
        },
        CANCEL: {
          target: 'idle',
          actions: assign(() => ({ confirmationValue: '', error: null })),
        },
      },
    },
    deleting: {
      invoke: fromPromise(ctx => ctx.destroyOrganization(), {
        onDone: 'deleted',
        onError: {
          target: 'confirming',
          actions: assign((_, event) => ({
            error: event.error instanceof Error ? event.error.message : 'Something went wrong. Please try again.',
          })),
        },
      }),
    },
    deleted: { type: 'final' },
  },
});
