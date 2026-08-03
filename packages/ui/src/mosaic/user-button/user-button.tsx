'use client';

import { useState } from 'react';

import { useSpinDelay } from '../hooks/useSpinDelay';
import { type UserButtonControllerOptions, useUserButtonController } from './user-button.controller';
import { userButtonBusyKeys, UserButtonTriggerSkeleton, UserButtonView } from './user-button.view';

export type UserButtonProps = UserButtonControllerOptions;

/**
 * The connected UserButton: reads live Clerk data through `useUserButtonController` and renders
 * the presentational `UserButtonView`. Owns the popover open state and the single in-flight action:
 * it marks the clicked affordance busy (spinner + disables the rest), closes the popover only when
 * the action resolves, and clears busy state (leaving the popover open) if it rejects. Actions that
 * open another surface (manage/create navigations) leave the popover as-is.
 */
export function UserButton(props: UserButtonProps = {}) {
  const controller = useUserButtonController(props);
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

  // Wraps a one-shot callback: block re-entry while busy, key the in-flight action for the view,
  // close on success, and always clear busy so a rejection cannot leave the UI hanging.
  const runAction = <Args extends unknown[]>(
    keyFor: (...args: Args) => string,
    fn?: (...args: Args) => void | Promise<unknown>,
  ) =>
    fn
      ? (...args: Args) => {
          if (pendingKey) {
            return;
          }
          setPendingKey(keyFor(...args));
          void Promise.resolve(fn(...args))
            .then(close, () => {})
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
      open={open}
      onOpenChange={setOpen}
      pendingKey={displayPendingKey}
      onSelectOrganization={runAction(userButtonBusyKeys.selectOrganization, onSelectOrganization)}
      onSwitchSession={runAction(userButtonBusyKeys.switchSession, onSwitchSession)}
      onSignOutSession={runAction(userButtonBusyKeys.signOutSession, onSignOutSession)}
      onSignOutAll={runAction(userButtonBusyKeys.signOutAll, onSignOutAll)}
      onAcceptSuggestion={runAction(userButtonBusyKeys.acceptSuggestion, onAcceptSuggestion)}
      onAcceptInvitation={runAction(userButtonBusyKeys.acceptInvitation, onAcceptInvitation)}
    />
  );
}
