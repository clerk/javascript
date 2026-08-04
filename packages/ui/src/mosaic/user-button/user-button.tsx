'use client';

import type { ReactElement } from 'react';
import { useState } from 'react';

import { useSpinDelay } from '../hooks/useSpinDelay';
import type { UserButtonController, UserButtonControllerOptions } from './user-button.controller';
import { useUserButtonController } from './user-button.controller';
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
  UserButtonModeProps;

/** The one action in flight: which affordance owns it, and what the surface froze on to run it. */
interface PendingAction {
  key: string;
  snapshot: Extract<UserButtonController, { status: 'ready' }>;
}

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
 * `mode` narrows the menu to one switcher, and `modePriority` picks which one a combined menu leads
 * with — in its header, and in the trigger beside the avatar. The other one is still listed.
 * ```tsx
 * <UserButton mode='orgs' />
 * <UserButton mode='user' />
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
  const { renderTriggerLabel, renderPlanBadge, mode, modePriority, customMenuItems, menuItemOrder, ...options } = props;
  const controller = useUserButtonController(options);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<PendingAction | null>(null);

  // Every action here is a network round trip, so there is nothing to debounce and the click gets
  // its spinner at once. The hook is still what steadies it, holding it up long enough to read.
  const displayPendingKey = useSpinDelay(action?.key ?? null, { delay: 0 });

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
          if (action) {
            return;
          }
          setAction({ key: keyFor(...args), snapshot: controller });
          void Promise.resolve(fn(...args))
            .then(closeOnSuccess ? close : () => {}, () => {})
            .finally(() => setAction(null));
        }
      : undefined;

  // A modal or another page takes over from here, so there is nothing left for the popover to show;
  // left up, it would sit over the very surface it just opened.
  const handOff = (fn: (() => void) | undefined) =>
    fn
      ? () => {
          close();
          fn();
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
    onManageAccount,
    onManageOrganization,
    onInviteMembers,
    onCreateOrganization,
    onAddAccount,
    ...data
  } = action?.snapshot ?? controller;

  return (
    <UserButtonView
      {...data}
      renderTriggerLabel={renderTriggerLabel}
      renderPlanBadge={renderPlanBadge}
      mode={mode}
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
      onManageAccount={handOff(onManageAccount)}
      onManageOrganization={handOff(onManageOrganization)}
      onInviteMembers={handOff(onInviteMembers)}
      onCreateOrganization={handOff(onCreateOrganization)}
      onAddAccount={handOff(onAddAccount)}
    />
  );
}
