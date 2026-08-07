import { setup } from '../machine/setup';
import type { UserButtonController } from './user-button.controller';

/** The controller once Clerk has answered, which is the only shape an action can start from. */
export type UserButtonReadyController = Extract<UserButtonController, { status: 'ready' }>;

export interface UserButtonMachineContext {
  /** The affordance that owns the action in flight: it spins, and every other one stands down. */
  pendingKey: string | null;
  /**
   * The controller the action started from. `setActive` swaps the active organization while its
   * promise is still in flight, so the live controller would rearrange the popup mid-action: the
   * header renaming itself, the check jumping rows, Invite coming and going as the permission is
   * re-read. The view renders this instead until the action settles.
   */
  frozen: UserButtonReadyController | null;
  /** Injected per-action effect — the controller callback the clicked row runs. */
  run: () => Promise<unknown>;
  /** Whether succeeding ends the interaction, and the popup with it. */
  closeOnSuccess: boolean;
}

export type UserButtonMachineEvent =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | {
      type: 'RUN';
      key: string;
      frozen: UserButtonReadyController;
      run: () => Promise<unknown>;
      closeOnSuccess: boolean;
    };

const { createMachine, assign, fromPromise } = setup<UserButtonMachineContext, UserButtonMachineEvent>();

const settled = { pendingKey: null, frozen: null };

export const userButtonMachine = createMachine({
  id: 'userButton',
  initial: 'closed',
  context: {
    pendingKey: null,
    frozen: null,
    run: () => Promise.resolve(),
    closeOnSuccess: false,
  },
  states: {
    closed: {
      on: { OPEN: 'open' },
    },
    open: {
      on: {
        CLOSE: 'closed',
        RUN: {
          target: 'busy',
          actions: assign((_, event) => ({
            pendingKey: event.key,
            frozen: event.frozen,
            run: event.run,
            closeOnSuccess: event.closeOnSuccess,
          })),
        },
      },
    },
    // Reached only from `open`, so a busy popup that is not open is unrepresentable, and RUN going
    // unhandled here is what stops a second action starting while one is in flight. Dismissing the
    // popup abandons the action: the request finishes, but nothing is left for its result to land in.
    busy: {
      on: { CLOSE: { target: 'closed', actions: assign(() => settled) } },
      invoke: fromPromise(context => context.run(), {
        onDone: [
          { target: 'closed', guard: context => context.closeOnSuccess, actions: assign(() => settled) },
          { target: 'open', actions: assign(() => settled) },
        ],
        // The popup stays up on a failure so the row can be clicked again. Nothing reports what went
        // wrong yet; the error surface is its own change, and carrying a message before one exists
        // would mean shipping an untranslated string nobody reads.
        onError: { target: 'open', actions: assign(() => settled) },
      }),
    },
  },
});
