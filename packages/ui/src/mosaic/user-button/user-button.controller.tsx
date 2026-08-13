'use client';

import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import { useSpinDelay } from '../hooks/useSpinDelay';
import { type UserButtonModelOptions, useUserButtonModel } from './user-button.model';
import type { UserButtonMenuProps, UserButtonModeProps } from './user-button.types';
import type { UserButtonTriggerProps } from './user-button.view';
import { userButtonBusyKeys, UserButtonView } from './user-button.view';

/** Everything `<UserButton />` takes: profile routing, trigger content, and the app's own menu rows. */
export type UserButtonProps = UserButtonModelOptions &
  UserButtonTriggerProps &
  UserButtonMenuProps &
  Pick<UserButtonModeProps, 'modePriority'> & {
    /**
     * Stands in while Clerk is still answering, so the space the button will take is held rather
     * than appearing under whatever is beside it. Dropped once nobody is signed in, since that is
     * an answer and not a wait.
     */
    fallback?: ReactNode;
  };

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
  const { renderTriggerLabel, renderTriggerBadge, modePriority, customMenuItems, menuItemOrder, fallback, ...options } =
    props;
  const model = useUserButtonModel(options);
  const [open, setOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  // Re-entry is guarded on the immediate `pendingKey`; only the view's feedback is delayed.
  const displayPendingKey = useSpinDelay(pendingKey);

  if (model.status === 'loading') {
    return <>{fallback}</>;
  }

  // Signed out is an answer, so the placeholder goes too rather than promising a button.
  if (model.status === 'hidden') {
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
  } = model;

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
