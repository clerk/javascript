import { setup } from '../../machine/setup';

export interface UserProfileDeleteSectionContext {
  /** Deletes the account. Injected by the view from its `onDelete` prop. */
  deleteAccount: () => Promise<void>;
  /** Why the last attempt failed. */
  errorMessage: string | undefined;
}

export type UserProfileDeleteSectionEvent = { type: 'OPEN' } | { type: 'CONFIRM' } | { type: 'CANCEL' };

const { createMachine, assign, fromPromise } = setup<UserProfileDeleteSectionContext, UserProfileDeleteSectionEvent>();

/**
 * The delete-account flow. `deleting` is the state that decides the dialog's fate: the
 * account is gone on success, so the machine finishes in `deleted` and never reopens,
 * while a failure drops back to `confirming` with the reason to render.
 *
 * The typed confirmation phrase is not here. It is a half-formed string that only the
 * `Destructive` block can use, so the block keeps it.
 */
export const userProfileDeleteSectionMachine = createMachine({
  id: 'deleteAccount',
  initial: 'idle',
  context: {
    deleteAccount: async () => {},
    errorMessage: undefined,
  },
  states: {
    idle: { on: { OPEN: 'confirming' } },
    confirming: {
      on: {
        CONFIRM: 'deleting',
        CANCEL: { target: 'idle', actions: assign(() => ({ errorMessage: undefined })) },
      },
    },
    deleting: {
      invoke: fromPromise(context => context.deleteAccount(), {
        onDone: 'deleted',
        onError: {
          target: 'confirming',
          actions: assign((_, event) => ({
            errorMessage:
              event.error instanceof Error ? event.error.message : 'Something went wrong. Please try again.',
          })),
        },
      }),
    },
    deleted: { type: 'final' },
  },
});
