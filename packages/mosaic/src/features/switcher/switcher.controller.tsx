import { useSpinDelay } from '../../hooks/use-spin-delay';
import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/use-machine';
import type { SwitcherModel } from './switcher.model';
import type { SwitcherMenuProps, SwitcherMode } from './switcher.types';
import type { SwitcherTriggerProps, SwitcherViewProps } from './switcher.view';
import { switcherBusyKeys } from './switcher.view';

/** The model once Clerk has answered, which is the only shape an action can start from. */
export type SwitcherReadyModel = Extract<SwitcherModel, { status: 'ready' }>;

interface SwitcherMachineContext {
  /** Independent of the action: dismissing must not abandon an in-flight invoke. */
  open: boolean;
  /** Which action is currently pending. */
  pendingKey: string | null;
  /**
   * The model the action started from. `setActive` swaps the active organization while its
   * promise is still in flight, so the live model would rearrange the popup mid-action.
   * The view renders this instead until the action settles.
   */
  frozenModel: SwitcherReadyModel | null;
  /** Injected per-action effect — the model callback the clicked row runs. */
  run: () => Promise<unknown>;
  /** Whether succeeding ends the interaction, and the popup with it. */
  closeOnSuccess: boolean;
}

type SwitcherMachineEvent =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | {
      type: 'RUN';
      key: string;
      frozenModel: SwitcherReadyModel;
      run: () => Promise<unknown>;
      closeOnSuccess: boolean;
    };

const { createMachine, assign, fromPromise } = setup<SwitcherMachineContext, SwitcherMachineEvent>();

const settled = { pendingKey: null, frozenModel: null };

const switcherMachine = createMachine({
  id: 'switcher',
  initial: 'idle',
  context: {
    open: false,
    pendingKey: null,
    frozenModel: null,
    run: () => Promise.resolve(),
    closeOnSuccess: false,
  },
  states: {
    idle: {
      on: {
        OPEN: { actions: assign(() => ({ open: true })) },
        CLOSE: { actions: assign(() => ({ open: false })) },
        RUN: {
          target: 'busy',
          guard: context => context.open,
          actions: assign((_, event) => ({
            pendingKey: event.key,
            frozenModel: event.frozenModel,
            run: event.run,
            closeOnSuccess: event.closeOnSuccess,
          })),
        },
      },
    },
    // OPEN/CLOSE have no target so they do not leave this state and abandon the invoke.
    busy: {
      on: {
        OPEN: { actions: assign(() => ({ open: true })) },
        CLOSE: { actions: assign(() => ({ open: false })) },
      },
      invoke: fromPromise(context => context.run(), {
        onDone: [
          {
            target: 'idle',
            guard: context => context.closeOnSuccess,
            actions: assign(() => ({ ...settled, open: false })),
          },
          { target: 'idle', actions: assign(() => settled) },
        ],
        // Leave `open` as the user left it. The error surface is a later change.
        onError: {
          target: 'idle',
          actions: [
            assign(() => settled),
            (_, event) => console.error('[Clerk] User button action failed', event.error),
          ],
        },
      }),
    },
  },
});

export type SwitcherControllerOptions = { mode?: SwitcherMode } & SwitcherMenuProps;

export type SwitcherController =
  | { status: 'loading' }
  | { status: 'hidden' }
  | ({ status: 'ready' } & Omit<SwitcherViewProps, keyof SwitcherTriggerProps>);

/**
 * The controller is the layer between the component (view) and the external world (model).
 * It represents the local state and wraps model actions in order to handle pending states,
 * keep the UI stable while an action is ongoing, close the popup on completed actions
 * when appropriate, etc.
 */
export function useSwitcherController(
  model: SwitcherModel,
  options: SwitcherControllerOptions = {},
): SwitcherController {
  const { mode: requestedMode, customMenuItems, menuItemOrder } = options;
  const [{ context }, send] = useMachine(switcherMachine);

  // Every action here is a network round trip, so we can start the
  // pending state immediately, we use this for the minDuration
  const displayPendingKey = useSpinDelay(context.pendingKey, {
    delay: 0,
    minDuration: context.closeOnSuccess ? 0 : undefined,
  });

  // If an action is pending and the model is frozen, we use the status of the frozen model.
  // This prevents the fallback from showing when we revert from ready->loading during Clerks
  // transitive state.
  const resolvedModel = context.frozenModel ?? model;
  if (resolvedModel.status !== 'ready') {
    return { status: resolvedModel.status };
  }

  if (requestedMode === 'organization' && !resolvedModel.organizationsEnabled) {
    return { status: 'hidden' };
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
            // RUN can only happen from a idle state, so this should always
            // resolve the actual current model, not a previously frozen
            // one. If the logic later changes so RUN can happen outside of
            // idle, using the resolvedModel here means we keep using the
            // first captured frozen model until all actions settle.
            frozenModel: resolvedModel,
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
  // lands in one step when it settles. See `frozenModel` in the machine for why.
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
  } = resolvedModel;

  // Force user mode if organizations are disabled
  const mode = organizationsEnabled ? requestedMode : 'user';

  return {
    status: 'ready',
    ...data,
    mode,
    customMenuItems: menuItems,
    menuItemOrder,
    open: context.open,
    onOpenChange: next => send(next ? { type: 'OPEN' } : { type: 'CLOSE' }),
    pendingKey: displayPendingKey,
    onSelectOrganization: runAction(switcherBusyKeys.selectOrganization, onSelectOrganization, true),
    onSwitchSession: runAction(switcherBusyKeys.switchSession, onSwitchSession),
    // Last-account and all-accounts sign-out unmount the button. Staying `open` would reopen the menu on the next sign-in.
    onSignOutSession: runAction(
      switcherBusyKeys.signOutSession,
      onSignOutSession,
      data.additionalSessions.length === 0,
    ),
    onSignOutAll: runAction(switcherBusyKeys.signOutAll, onSignOutAll, true),
    onAcceptSuggestion: runAction(switcherBusyKeys.acceptSuggestion, onAcceptSuggestion),
    onAcceptInvitation: runAction(switcherBusyKeys.acceptInvitation, onAcceptInvitation),
    onManageAccount: handOff(onManageAccount),
    onManageOrganization: handOff(onManageOrganization),
    onInviteMembers: handOff(onInviteMembers),
    onCreateOrganization: handOff(onCreateOrganization),
    onAddAccount: handOff(onAddAccount),
  };
}
