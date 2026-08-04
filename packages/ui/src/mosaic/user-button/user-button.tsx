'use client';

import { useState } from 'react';

import { useSpinDelay } from '../hooks/useSpinDelay';
import type { UserButtonController, UserButtonControllerOptions } from './user-button.controller';
import { useUserButtonController } from './user-button.controller';
import type { UserButtonRootProps, UserButtonTriggerProps } from './user-button.view';
import { userButtonBusyKeys, UserButtonTriggerSkeleton, UserButtonView } from './user-button.view';

export type UserButtonProps = UserButtonControllerOptions &
  UserButtonTriggerProps &
  Pick<UserButtonRootProps, 'modePriority'>;

/** The one action in flight: which affordance owns it, and what the surface froze on to run it. */
interface PendingAction {
  key: string;
  snapshot: Extract<UserButtonController, { status: 'ready' }>;
}

/**
 * The connected UserButton: reads live Clerk data through `useUserButtonController` and renders
 * the presentational `UserButtonView`. Owns the popover open state and the single in-flight action:
 * it marks the clicked affordance busy (spinner + disables the rest), holds the surface still on
 * the data the action started from, closes the popover only when the action resolves, and clears
 * busy state (leaving the popover open) if it rejects. Actions that open another surface
 * (manage/create navigations) leave the popover as-is.
 */
export function UserButton({ renderTriggerLabel, renderPlanBadge, modePriority, ...options }: UserButtonProps = {}) {
  const controller = useUserButtonController(options);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<PendingAction | null>(null);

  // Every action here is a network round trip, so there is nothing to debounce and the click gets
  // its spinner at once. The hook is still what steadies it, holding it up long enough to read.
  const displayPendingKey = useSpinDelay(action?.key ?? null, { delay: 0 });

  if (controller.status === 'loading') {
    return <UserButtonTriggerSkeleton />;
  }

  if (controller.status !== 'ready') {
    return null;
  }

  const close = () => setOpen(false);

  // Wraps a one-shot callback: block re-entry while busy, key the in-flight action for the view, and
  // always clear busy so a rejection cannot leave the UI hanging. Only an action that ends the
  // interaction closes the surface; the rest resolve into a popover that re-renders around the
  // result, so you can see what you just did.
  const runAction = <Args extends unknown[]>(
    keyFor: (...args: Args) => string,
    fn: ((...args: Args) => void | Promise<unknown>) | undefined,
    closeOnSuccess = false,
  ) =>
    fn
      ? (...args: Args) => {
          if (action) {
            return;
          }
          setAction({ key: keyFor(...args), snapshot: controller });
          void Promise.resolve(fn(...args))
            .then(closeOnSuccess ? close : () => {}, () => {})
            .finally(() => setAction(null));
        }
      : undefined;

  // `setActive` swaps the active organization while its promise is still in flight, so the live
  // controller would rearrange the popup mid-action: the header renaming itself, the check jumping
  // rows, Invite coming and going as the permission is re-read. Rendering the snapshot the action
  // started from holds it all still, and the result lands in one step when the action settles.
  const {
    status: _status,
    onSelectOrganization,
    onSwitchSession,
    onSignOutSession,
    onSignOutAll,
    onAcceptSuggestion,
    onAcceptInvitation,
    ...data
  } = action?.snapshot ?? controller;

  return (
    <UserButtonView
      {...data}
      renderTriggerLabel={renderTriggerLabel}
      renderPlanBadge={renderPlanBadge}
      modePriority={modePriority}
      open={open}
      onOpenChange={setOpen}
      pendingKey={displayPendingKey}
      onSelectOrganization={runAction(userButtonBusyKeys.selectOrganization, onSelectOrganization, true)}
      onSwitchSession={runAction(userButtonBusyKeys.switchSession, onSwitchSession)}
      onSignOutSession={runAction(userButtonBusyKeys.signOutSession, onSignOutSession)}
      onSignOutAll={runAction(userButtonBusyKeys.signOutAll, onSignOutAll)}
      onAcceptSuggestion={runAction(userButtonBusyKeys.acceptSuggestion, onAcceptSuggestion)}
      onAcceptInvitation={runAction(userButtonBusyKeys.acceptInvitation, onAcceptInvitation)}
    />
  );
}
