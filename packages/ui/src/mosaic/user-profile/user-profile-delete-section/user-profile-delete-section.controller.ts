import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/useMachine';

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

export interface UserProfileDeleteSectionControllerOptions {
  /**
   * Deletes the account. Resolve and the flow finishes; reject with an `Error` and it returns to
   * the confirmation step with that message.
   */
  onDelete: () => Promise<void>;
}

export interface UserProfileDeleteSectionController {
  /** Whether the confirmation dialog is open */
  isOpen: boolean;
  /** Opens or closes the confirmation dialog */
  onOpenChange: (open: boolean) => void;
  /** Starts the delete */
  onConfirm: () => void;
  /** Whether the delete is in progress */
  isDeleting: boolean;
  /** Why the last attempt failed */
  errorMessage: string | undefined;
}

/**
 * Drives the delete-account flow and hands the view plain props. A machine backs it because the
 * flow has an async step, an error path back to a previous step, and a terminal state that must
 * never reopen. A simpler section is free to hold its state in `useState`; the view cannot tell.
 */
export function useUserProfileDeleteSectionController({
  onDelete,
}: UserProfileDeleteSectionControllerOptions): UserProfileDeleteSectionController {
  const [snapshot, send] = useMachine(userProfileDeleteSectionMachine, { context: { deleteAccount: onDelete } });

  return {
    isOpen: snapshot.value === 'confirming' || snapshot.value === 'deleting',
    onOpenChange: open => send({ type: open ? 'OPEN' : 'CANCEL' }),
    onConfirm: () => send({ type: 'CONFIRM' }),
    isDeleting: snapshot.value === 'deleting',
    errorMessage: snapshot.context.errorMessage,
  };
}
