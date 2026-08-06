'use client';

import { useState } from 'react';

import { useSpinDelay } from '../hooks/useSpinDelay';
import { type UserButtonControllerOptions, useUserButtonController } from './user-button.controller';
import type { UserButtonRootProps, UserButtonTriggerProps } from './user-button.view';
import { userButtonBusyKeys, UserButtonTriggerSkeleton, UserButtonView } from './user-button.view';

export type UserButtonProps = UserButtonControllerOptions &
  UserButtonTriggerProps &
  Pick<UserButtonRootProps, 'modePriority' | 'customMenuItems' | 'menuItemOrder'>;

/**
 * The connected UserButton: reads live Clerk data through `useUserButtonController` and renders
 * the presentational `UserButtonView`. Owns the popover open state and the single in-flight action:
 * it marks the clicked affordance busy (spinner + disables the rest), closes the popover only when
 * the action resolves, and clears busy state (leaving the popover open) if it rejects. Actions that
 * open another surface (manage/create navigations) leave the popover as-is.
 */
export function UserButton({
  renderTriggerLabel,
  renderPlanBadge,
  modePriority,
  customMenuItems,
  menuItemOrder,
  ...options
}: UserButtonProps = {}) {
  const controller = useUserButtonController(options);
  const [open, setOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  // Hold the spinner off for quick actions and steady it once shown. Re-entry is still guarded on
  // the immediate `pendingKey`; only the view's feedback is delayed.
  const displayPendingKey = useSpinDelay(pendingKey);

  if (controller.status === 'loading') {
    return <UserButtonTriggerSkeleton />;
  }

  if (controller.status !== 'ready') {
    return null;
  }

  const close = () => setOpen(false);

  // A custom action is the app's to run, and whatever it opens takes over from here, so the popover
  // goes with it. A link navigates away on its own.
  const menuItems = customMenuItems?.map(item =>
    item.href === undefined
      ? {
          ...item,
          onClick: () => {
            close();
            item.onClick();
          },
        }
      : item,
  );

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
          if (pendingKey) {
            return;
          }
          setPendingKey(keyFor(...args));
          void Promise.resolve(fn(...args))
            .then(closeOnSuccess ? close : () => {}, () => {})
            .finally(() => setPendingKey(null));
        }
      : undefined;

  const {
    status: _status,
    onSelectOrganization,
    onSwitchSession,
    onSignOutSession,
    onSignOutAll,
    onAcceptSuggestion,
    onAcceptInvitation,
    ...data
  } = controller;

  return (
    <UserButtonView
      {...data}
      renderTriggerLabel={renderTriggerLabel}
      renderPlanBadge={renderPlanBadge}
      modePriority={modePriority}
      customMenuItems={menuItems}
      menuItemOrder={menuItemOrder}
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
