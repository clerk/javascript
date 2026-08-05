'use client';

import { useState } from 'react';

import type { CustomProfileItem } from '../hooks/useCustomPages';
import { useCustomPages } from '../hooks/useCustomPages';
import { useSpinDelay } from '../hooks/useSpinDelay';
import type { UserProfilePageId } from '../hooks/useUserProfilePages';
import { useUserProfilePages } from '../hooks/useUserProfilePages';
import type { UserButtonController, UserButtonControllerOptions } from './user-button.controller';
import { useUserButtonController } from './user-button.controller';
import type { UserButtonRootProps, UserButtonTriggerProps } from './user-button.view';
import { userButtonBusyKeys, UserButtonTriggerSkeleton, UserButtonView } from './user-button.view';

/** Configures the UserProfile this button opens. */
export interface UserButtonUserProfileProps {
  /** Pages and links of your own, added to the profile's navigation. */
  customPages?: CustomProfileItem[];
  /**
   * The order the profile's navigation runs in, by id: a built-in page's id, or a custom entry's
   * `path` or `href`. Anything left out follows the pages named here. The first page is the one the
   * profile opens on, so it cannot be a link.
   */
  pageOrder?: (UserProfilePageId | (string & {}))[];
}

export type UserButtonProps = UserButtonControllerOptions &
  UserButtonTriggerProps &
  Pick<UserButtonRootProps, 'mode' | 'modePriority'> & {
    userProfileProps?: UserButtonUserProfileProps;
  };

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
 * busy state (leaving the popover open) if it rejects. Actions that hand off to another surface
 * (managing, inviting, creating, adding an account) close the popover on the way out.
 */
export function UserButton({
  renderTriggerLabel,
  renderPlanBadge,
  mode,
  modePriority,
  userProfileProps,
  ...options
}: UserButtonProps = {}) {
  // The profile opens in clerk-js's own React root, so its custom pages reach it as portals rendered
  // from here. They have to outlive the popover that opened it, and the button's own data with it,
  // which is why they hang off the container rather than anything the popover renders.
  const builtInPages = useUserProfilePages();
  const { customPages, portals } = useCustomPages({
    items: userProfileProps?.customPages,
    order: userProfileProps?.pageOrder,
    builtInPages,
  });
  const controller = useUserButtonController(options, customPages);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<PendingAction | null>(null);

  // Every action here is a network round trip, so there is nothing to debounce and the click gets
  // its spinner at once. The hook is still what steadies it, holding it up long enough to read.
  const displayPendingKey = useSpinDelay(action?.key ?? null, { delay: 0 });

  if (controller.status === 'loading') {
    return (
      <>
        <UserButtonTriggerSkeleton
          mode={mode}
          modePriority={modePriority}
        />
        {portals}
      </>
    );
  }

  if (controller.status !== 'ready') {
    return <>{portals}</>;
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
    <>
      <UserButtonView
        {...data}
        renderTriggerLabel={renderTriggerLabel}
        renderPlanBadge={renderPlanBadge}
        mode={mode}
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
        onManageAccount={handOff(onManageAccount)}
        onManageOrganization={handOff(onManageOrganization)}
        onInviteMembers={handOff(onInviteMembers)}
        onCreateOrganization={handOff(onCreateOrganization)}
        onAddAccount={handOff(onAddAccount)}
      />
      {portals}
    </>
  );
}
