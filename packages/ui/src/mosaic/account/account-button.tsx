'use client';

import { useState } from 'react';

import { type AccountButtonControllerOptions, useAccountButtonController } from './account-button.controller';
import { AccountButtonView } from './account-button.view';

export type AccountButtonProps = AccountButtonControllerOptions;

/**
 * The connected AccountButton: reads live Clerk data through `useAccountButtonController` and renders
 * the presentational `AccountButtonView`. Owns the popover open state and closes it after a successful
 * one-shot action (select/switch/sign out/accept). Actions that open another surface
 * (manage/create navigations) leave the popover as-is.
 */
export function AccountButton(props: AccountButtonProps = {}) {
  const controller = useAccountButtonController(props);
  const [open, setOpen] = useState(false);

  if (controller.status !== 'ready') {
    return null;
  }

  const close = () => setOpen(false);
  const closeOnSuccess = <Args extends unknown[]>(fn?: (...args: Args) => void) =>
    fn ? (...args: Args) => void Promise.resolve(fn(...args)).finally(close) : undefined;

  const { status, ...data } = controller;

  return (
    <AccountButtonView
      {...data}
      status={status}
      open={open}
      onOpenChange={setOpen}
      onSelectOrganization={closeOnSuccess(data.onSelectOrganization)}
      onSelectPersonal={closeOnSuccess(data.onSelectPersonal)}
      onSwitchAccount={closeOnSuccess(data.onSwitchAccount)}
      onSignOutSession={closeOnSuccess(data.onSignOutSession)}
      onSignOutAll={closeOnSuccess(data.onSignOutAll)}
      onAcceptSuggestion={closeOnSuccess(data.onAcceptSuggestion)}
      onAcceptInvitation={closeOnSuccess(data.onAcceptInvitation)}
    />
  );
}
