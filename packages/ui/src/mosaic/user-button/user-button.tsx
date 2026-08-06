'use client';

import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import { useMosaicEnvironment } from '../hooks/useMosaicEnvironment';
import { useSpinDelay } from '../hooks/useSpinDelay';
import type { UserButtonController, UserButtonControllerOptions } from './user-button.controller';
import { useUserButtonController } from './user-button.controller';
import type { UserButtonMenuProps, UserButtonModeProps } from './user-button.types';
import type { UserButtonTriggerProps } from './user-button.view';
import { userButtonBusyKeys, UserButtonView } from './user-button.view';

/** Everything `<UserButton />` takes: profile routing, trigger content, and the app's own menu rows. */
export type UserButtonProps = UserButtonControllerOptions &
  UserButtonTriggerProps &
  UserButtonMenuProps &
  UserButtonModeProps & {
    /**
     * Stands in while Clerk is still answering, so the space the button will take is held rather
     * than appearing under whatever is beside it. Dropped once nobody is signed in, since that is
     * an answer and not a wait.
     */
    fallback?: ReactNode;
  };

/** The one action in flight: which affordance owns it, and what the surface froze on to run it. */
interface PendingAction {
  key: string;
  snapshot: Extract<UserButtonController, { status: 'ready' }>;
}

/**
 * The signed-in user's avatar, and the menu behind it: switch organization, switch or add an account,
 * open the profile, and sign out. It reads the active session and organization from Clerk, so it takes
 * no data. It renders `fallback` until Clerk answers, and nothing at all when nobody is signed in.
 *
 * Each action is a request: the row you click spins, the others stand down, and the menu stays open on
 * the result. Only an action that navigates closes it.
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
 * `fallback` holds the space while Clerk is still answering. Size it to the trigger to keep the row
 * it sits in from moving. Nothing stands in once the answer is that nobody is signed in.
 * ```tsx
 * <UserButton fallback={<AvatarSkeleton />} />
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
  const { renderTriggerLabel, renderTriggerBadge, mode: requestedMode, modePriority, customMenuItems, menuItemOrder, fallback, ...options } =
    props;
  const controller = useUserButtonController(options);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<PendingAction | null>(null);

  // Organizations off at the instance leaves nothing for an organization surface to lead with or
  // list, so the button is the account's whatever mode asked for. clerk-js withholds its own
  // `<OrganizationSwitcher>` at the mount boundary; nothing mounts this one, so the gate lives here.
  const organizationsEnabled = useMosaicEnvironment()?.organizationSettings?.enabled ?? true;
  const mode = organizationsEnabled ? requestedMode : 'user';

  // Every action here is a network round trip, so there is nothing to debounce and the click gets
  // its spinner at once. The hook is still what steadies it, holding it up long enough to read.
  const displayPendingKey = useSpinDelay(action?.key ?? null, { delay: 0 });

  if (controller.status === 'loading') {
    return <>{fallback}</>;
  }

  // Signed out is an answer, so the placeholder goes too rather than promising a button.
  if (controller.status === 'hidden') {
    return null;
  }

  const close = () => setOpen(false);

  // Whatever the app's action opens takes over from here, so the popover goes with it. Links navigate away.
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

  // Only an action that ends the interaction closes the popover; the rest resolve into it.
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
          .then(closeOnSuccess ? close : () => { }, () => { })
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
      renderTriggerBadge={renderTriggerBadge}
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
