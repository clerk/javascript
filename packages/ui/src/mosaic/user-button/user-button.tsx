'use client';

import { useState } from 'react';

import { useUserButtonController } from './user-button.controller';
import { UserButtonView } from './user-button.view';

/**
 * The connected UserButton: reads live Clerk data through `useUserButtonController` and renders
 * the presentational `UserButtonView`. Owns the popover open state and closes it after a successful
 * one-shot action (select/switch/sign out/accept). Actions that open another surface
 * (manage/create navigations) leave the popover as-is.
 */
export function UserButton() {
  const controller = useUserButtonController();
  const [open, setOpen] = useState(false);

  if (controller.status !== 'ready') {
    return null;
  }

  const close = () => setOpen(false);
  const closeOnSuccess = <Args extends unknown[]>(fn?: (...args: Args) => void) =>
    fn ? (...args: Args) => void Promise.resolve(fn(...args)).finally(close) : undefined;

  const { status: _status, ...data } = controller;

  return (
    <UserButtonView
      {...data}
      open={open}
      onOpenChange={setOpen}
      onSelectOrganization={closeOnSuccess(data.onSelectOrganization)}
      onSwitchSession={closeOnSuccess(data.onSwitchSession)}
      onSignOutSession={closeOnSuccess(data.onSignOutSession)}
      onSignOutAll={closeOnSuccess(data.onSignOutAll)}
      onAcceptSuggestion={closeOnSuccess(data.onAcceptSuggestion)}
      onAcceptInvitation={closeOnSuccess(data.onAcceptInvitation)}
    />
  );
}
