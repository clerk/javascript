'use client';

import { useState } from 'react';

import { type AccountButtonControllerOptions, useAccountButtonController } from './account-button.controller';
import { accountBusyKeys, AccountButtonTriggerSkeleton, AccountButtonView } from './account-button.view';

export type AccountButtonProps = AccountButtonControllerOptions;

/**
 * The connected AccountButton: reads live Clerk data through `useAccountButtonController` and renders
 * the presentational `AccountButtonView`. Owns the popover open state and the single in-flight action:
 * it marks the clicked affordance busy (spinner + disables the rest), closes the popover only when the
 * action resolves, and clears busy state (leaving the popover open) if it rejects. Actions that open
 * another surface (manage/create navigations) leave the popover as-is.
 */
export function AccountButton(props: AccountButtonProps = {}) {
  const controller = useAccountButtonController(props);
  const [open, setOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  if (controller.status === 'loading') {
    return <AccountButtonTriggerSkeleton />;
  }

  if (controller.status !== 'ready') {
    return null;
  }

  const close = () => setOpen(false);

  // Wraps a one-shot callback: block re-entry while busy, key the in-flight action for the view,
  // close on success, and always clear busy so a rejection can't leave the UI hanging.
  const runAction = <Args extends unknown[]>(keyFor: (...args: Args) => string, fn?: (...args: Args) => void) =>
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

  const { status, ...data } = controller;

  return (
    <AccountButtonView
      {...data}
      status={status}
      open={open}
      onOpenChange={setOpen}
      pendingKey={pendingKey}
      onSelectOrganization={runAction(accountBusyKeys.selectOrganization, data.onSelectOrganization)}
      onSelectPersonal={runAction(accountBusyKeys.selectPersonal, data.onSelectPersonal)}
      onSwitchAccount={runAction(accountBusyKeys.switchAccount, data.onSwitchAccount)}
      onSignOutSession={runAction(accountBusyKeys.signOutSession, data.onSignOutSession)}
      onSignOutAll={runAction(accountBusyKeys.signOutAll, data.onSignOutAll)}
      onAcceptSuggestion={runAction(accountBusyKeys.acceptSuggestion, data.onAcceptSuggestion)}
      onAcceptInvitation={runAction(accountBusyKeys.acceptInvitation, data.onAcceptInvitation)}
    />
  );
}
