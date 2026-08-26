import { useSpinDelay } from '../hooks/useSpinDelay';
import { setup } from '../machine/setup';
import { useMachine } from '../machine/useMachine';
import type { UserButtonModel } from './user-button.model';
import type { UserButtonMenuProps, UserButtonModeProps } from './user-button.types';
import type { UserButtonProps as UserButtonViewProps, UserButtonTriggerProps } from './user-button.view';
import { userButtonBusyKeys } from './user-button.view';

/** The model once Clerk has answered, which is the only shape an action can start from. */
export type UserButtonReadyModel = Extract<UserButtonModel, { status: 'ready' }>;

interface UserButtonMachineContext {
  /** Which action is currently pending. */
  pendingKey: string | null;
  /**
   * The model the action started from. `setActive` swaps the active organization while its
   * promise is still in flight, so the live model would rearrange the popup mid-action.
   * The view renders this instead until the action settles.
   */
  frozen: UserButtonReadyModel | null;
  /** Injected per-action effect — the model callback the clicked row runs. */
  run: () => Promise<unknown>;
  /** Whether succeeding ends the interaction, and the popup with it. */
  closeOnSuccess: boolean;
}

type UserButtonMachineEvent =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | {
      type: 'RUN';
      key: string;
      frozen: UserButtonReadyModel;
      run: () => Promise<unknown>;
      closeOnSuccess: boolean;
    };

const { createMachine, assign, fromPromise } = setup<UserButtonMachineContext, UserButtonMachineEvent>();

const settled = { pendingKey: null, frozen: null };

const userButtonMachine = createMachine({
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

export type UserButtonControllerOptions = Pick<UserButtonModeProps, 'mode' | 'modePriority'> & UserButtonMenuProps;

export type UserButtonController =
  | { status: 'loading' }
  | { status: 'hidden' }
  | ({ status: 'ready' } & Omit<UserButtonViewProps, keyof UserButtonTriggerProps>);

/**
 * The controller is the layer between the component (view) and the external world (model).
 * It represents the local state and wraps model actions in order to handle pending states,
 * keep the UI stable while an action is ongoing, close the popup on completed actions
 * when appropriate, etc.
 */
export function useUserButtonController(
  model: UserButtonModel,
  options: UserButtonControllerOptions = {},
): UserButtonController {
  const { mode: requestedMode, modePriority, customMenuItems, menuItemOrder } = options;
  // The popover's open state and the one action in flight are the same flow: an action that ends the
  // interaction closes the surface, so they settle together or not at all.
  const [{ value, context }, send] = useMachine(userButtonMachine);

  // Every action here is a network round trip, so we can start the
  // pending state immediately, we use this for the minDuration
  const displayPendingKey = useSpinDelay(context.pendingKey, {
    delay: 0,
    minDuration: context.closeOnSuccess ? 0 : undefined,
  });

  if (model.status !== 'ready') {
    return { status: model.status };
  }

  const close = () => send({ type: 'CLOSE' });

  const menuItems = customMenuItems?.map(item =>
    item.href === undefined
      ? {
          ...item,
          onClick: () => {
            // Always close the menu for custom actions
            close();
            item.onClick();
          },
        }
      : item,
  );

  // Wrapper to tie a callback into the machine
  const runAction = <Args extends unknown[]>(
    keyFor: (...args: Args) => string,
    fn: ((...args: Args) => void | Promise<unknown>) | undefined,
    closeOnSuccess = false,
  ) =>
    fn
      ? (...args: Args) =>
          send({
            type: 'RUN',
            key: keyFor(...args),
            frozen: model,
            run: async () => fn(...args),
            closeOnSuccess,
          })
      : undefined;

  // A callback that wraps a callback so it always closes the popup when done
  const handOff = (fn: (() => void) | undefined) =>
    fn
      ? () => {
          close();
          fn();
        }
      : undefined;

  // Rendering the model the action froze on holds the popup still while it runs; the result
  // lands in one step when it settles. See `frozen` in the machine for why.
  const {
    status: _status,
    organizationsEnabled,
    onSelectOrganization,
    onSwitchSession,
    onSignOutSession,
    onSignOutAll,
    onAcceptSuggestion,
    onAcceptInvitation,
    onManageAccount,
    onManageOrganization,
    onInviteMembers,
    onCreateOrganization,
    onAddAccount,
    ...data
  } = context.frozen ?? model;

  // Force user mode if organizations are disabled
  const mode = model.organizationsEnabled ? requestedMode : 'user';

  return {
    status: 'ready',
    ...data,
    mode,
    modePriority,
    customMenuItems: menuItems,
    menuItemOrder,
    open: value !== 'closed',
    onOpenChange: next => send(next ? { type: 'OPEN' } : { type: 'CLOSE' }),
    pendingKey: displayPendingKey,
    onSelectOrganization: runAction(userButtonBusyKeys.selectOrganization, onSelectOrganization, true),
    onSwitchSession: runAction(userButtonBusyKeys.switchSession, onSwitchSession),
    // Last-account and all-accounts sign-out unmount the button. Staying `open` would reopen the menu on the next sign-in.
    onSignOutSession: runAction(
      userButtonBusyKeys.signOutSession,
      onSignOutSession,
      data.additionalSessions.length === 0,
    ),
    onSignOutAll: runAction(userButtonBusyKeys.signOutAll, onSignOutAll, true),
    onAcceptSuggestion: runAction(userButtonBusyKeys.acceptSuggestion, onAcceptSuggestion),
    onAcceptInvitation: runAction(userButtonBusyKeys.acceptInvitation, onAcceptInvitation),
    onManageAccount: handOff(onManageAccount),
    onManageOrganization: handOff(onManageOrganization),
    onInviteMembers: handOff(onInviteMembers),
    onCreateOrganization: handOff(onCreateOrganization),
    onAddAccount: handOff(onAddAccount),
  };
}
