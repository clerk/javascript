'use client';

import type { ReactElement } from 'react';
import { useState } from 'react';

import { useSpinDelay } from '../hooks/useSpinDelay';
import { type UserButtonControllerOptions, useUserButtonController } from './user-button.controller';
import type { UserButtonMenuProps, UserButtonModeProps } from './user-button.types';
import type { UserButtonTriggerProps } from './user-button.view';
import { userButtonBusyKeys, UserButtonView } from './user-button.view';

/**
 * Everything `<UserButton />` takes: where its profile surfaces open (`UserButtonControllerOptions`),
 * what the trigger shows (`UserButtonTriggerProps`), and the app's own rows at the foot of the menu
 * (`UserButtonMenuProps`).
 */
export type UserButtonProps = UserButtonControllerOptions &
  UserButtonTriggerProps &
  UserButtonMenuProps &
  Pick<UserButtonModeProps, 'modePriority'>;

/**
 * The signed-in user's avatar, and the menu behind it: switch organization, switch or add an
 * account, open the profile, and sign out. It reads the active session and organization from Clerk
 * itself, so it takes no data — drop it in a nav bar and it renders nothing until Clerk has answered,
 * and nothing at all when nobody is signed in.
 *
 * Every action in the menu is a request, so the row you click spins while the others stand down, and
 * the menu stays open on the result. Only an action that takes you somewhere else closes it.
 *
 * @example
 * ```tsx
 * import { UserButton } from '@clerk/ui/mosaic';
 *
 * <UserButton />
 * ```
 *
 * @example
 * `modePriority` picks which switcher the menu leads with — in its header, and in the trigger beside
 * the avatar. The other one is still listed.
 * ```tsx
 * <UserButton modePriority='user' />
 * ```
 *
 * @example
 * Passing a URL routes to a page of your own instead of opening Clerk's modal; that is the whole
 * opt-in. `afterSelectOrganizationUrl` is where switching organization lands, and takes a `:param`
 * template, a plain path, or a function.
 * ```tsx
 * <UserButton
 *   userProfileUrl='/account'
 *   organizationProfileUrl='/settings/organization'
 *   afterSelectOrganizationUrl='/orgs/:slug'
 * />
 * ```
 *
 * @example
 * `customMenuItems` adds your own rows to the foot of the menu, each one either an `onClick` action
 * or an `href` link, and `menuItemOrder` names the order the foot's rows run in.
 * ```tsx
 * <UserButton
 *   customMenuItems={[
 *     { id: 'docs', label: 'Documentation', icon: <BookIcon />, href: 'https://example.com/docs' },
 *     { id: 'support', label: 'Contact support', icon: <ChatIcon />, onClick: () => openSupportChat() },
 *   ]}
 *   menuItemOrder={['docs', 'support', 'addAccount', 'signOutAll']}
 * />
 * ```
 */
export function UserButton(props: UserButtonProps = {}): ReactElement | null {
  const { renderTriggerLabel, renderTriggerBadge, modePriority, customMenuItems, menuItemOrder, ...options } = props;
  const controller = useUserButtonController(options);
  const [open, setOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  // Hold the spinner off for quick actions and steady it once shown. Re-entry is still guarded on
  // the immediate `pendingKey`; only the view's feedback is delayed.
  const displayPendingKey = useSpinDelay(pendingKey);

  // Nothing stands in for the button until Clerk answers: while it is loading, a signed-out visitor
  // is indistinguishable from a session still resolving, so anything rendered here is a button
  // promised to people who are never going to get one. `<ClerkLoading>` is where an app that knows
  // its own nav puts a placeholder.
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
      renderTriggerBadge={renderTriggerBadge}
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
