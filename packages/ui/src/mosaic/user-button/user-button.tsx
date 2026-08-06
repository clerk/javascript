'use client';

import type { ReactElement, ReactNode } from 'react';

import { useUserButtonController } from './user-button.controller';
import type { UserButtonModelOptions } from './user-button.model';
import { useUserButtonModel } from './user-button.model';
import type { CustomProfileItem, UserProfilePageId } from './user-button.pages';
import { useCustomPages, useUserProfilePages } from './user-button.pages';
import type { UserButtonMenuProps, UserButtonModeProps } from './user-button.types';
import type { UserButtonTriggerProps } from './user-button.view';
import { UserButtonView } from './user-button.view';

/** Configures the UserProfile this button opens. */
export interface UserButtonUserProfileProps {
  /** Pages and links of your own, added to the profile's navigation. */
  customPages?: CustomProfileItem[];
  /**
   * The order the profile's navigation runs in, by id: a built-in page's id, or a custom entry's
   * `path`. Anything left out follows the pages named here. The first page is the one the profile
   * opens on, so it cannot be a link.
   */
  pageOrder?: (UserProfilePageId | (string & {}))[];
}

/** Everything `<UserButton />` takes: profile routing, trigger content, the app's own menu rows, and the profile it opens. */
// TODO: Possibly missing, verify these before GA:
// defaultOpen, signInUrl, userProfileProps.additionalOAuthScopes, userProfileProps.apiKeysProps, userProfileProps.appearance, customMenuItems open/startPath, afterCreateOrganizationUrl, skipInvitationScreen, afterLeaveOrganizationUrl, organizationProfileProps
export type UserButtonProps = UserButtonModelOptions &
  UserButtonTriggerProps &
  UserButtonMenuProps &
  UserButtonModeProps & {
    userProfileProps?: UserButtonUserProfileProps;
    /**
     * Fallback while loading.
     *
     * Note that the UserButton renders nothing when the user is signed out, so using this on
     * pages that are reachable while both signed-out and signed-in can result in Fallback->Nothing.
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
 * import { UserButton } from '@clerk/nextjs/experimental/mosaic';
 *
 * <UserButton />
 * ```
 *
 * @example
 * `mode` narrows the menu to one switcher, and `modePriority` picks which one a combined menu leads
 * with — in its header, and in the trigger beside the avatar. The other one is still listed.
 * ```tsx
 * <UserButton mode='organization' />
 * <UserButton mode='user' />
 * <UserButton modePriority='user' />
 * ```
 *
 * @example
 * Passing a URL routes to a page of your own instead of opening Clerk's modal; that is the whole
 * opt-in. `afterSelectOrganizationUrl` is where switching organization lands, and takes a `:param`
 * template, a plain path, or a function. `afterSwitchSessionUrl` is where switching account lands.
 * ```tsx
 * <UserButton
 *   userProfileUrl='/account'
 *   organizationProfileUrl='/settings/organization'
 *   afterSelectOrganizationUrl='/orgs/:slug'
 *   afterSwitchSessionUrl='/dashboard'
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
 * `customPages` adds your own pages to the profile this button opens; `customMenuItems` adds your
 * own rows to the foot of the menu, each one either an `onClick` action or an `href` link.
 * ```tsx
 * <UserButton
 *   userProfileProps={{
 *     customPages: [{ path: 'usage', label: 'Usage', icon: <ChartIcon />, content: <UsagePage /> }],
 *     pageOrder: ['account', 'usage', 'security'],
 *   }}
 *   customMenuItems={[
 *     { id: 'docs', label: 'Documentation', icon: <BookIcon />, href: 'https://example.com/docs' },
 *     { id: 'support', label: 'Contact support', icon: <ChatIcon />, onClick: () => openSupportChat() },
 *   ]}
 *   menuItemOrder={['docs', 'support', 'addAccount', 'signOutAll']}
 * />
 * ```
 */
export function UserButton(props: UserButtonProps = {}): ReactElement | null {
  const {
    renderTriggerLabel,
    renderTriggerBadge,
    mode,
    modePriority,
    userProfileProps,
    customMenuItems,
    menuItemOrder,
    fallback,
    ...options
  } = props;
  // The profile opens in clerk-js's own React root, so its custom pages reach it as portals rendered
  // from here. They have to outlive the popover that opened it, and the button's own data with it,
  // which is why they hang off the wrapper rather than anything the popover renders.
  const builtInPages = useUserProfilePages();
  const { customPages, portals } = useCustomPages({
    items: userProfileProps?.customPages,
    order: userProfileProps?.pageOrder,
    builtInPages,
  });
  const model = useUserButtonModel(options, customPages);
  const controller = useUserButtonController(model, { mode, modePriority, customMenuItems, menuItemOrder });

  if (controller.status === 'loading') {
    return (
      <>
        {fallback}
        {portals}
      </>
    );
  }

  // Signed out is an answer, so the placeholder goes too rather than promising a button.
  if (controller.status === 'hidden') {
    return <>{portals}</>;
  }

  const { status: _status, ...viewController } = controller;

  return (
    <>
      <UserButtonView
        {...viewController}
        renderTriggerLabel={renderTriggerLabel}
        renderTriggerBadge={renderTriggerBadge}
      />
      {portals}
    </>
  );
}
