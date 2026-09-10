'use client';

import type { OrganizationProfileProps, UserProfileProps } from '@clerk/shared/types';
import type { ReactElement, ReactNode } from 'react';

import type { CustomProfileItem, UserProfilePageId } from '../user-profile/user-profile.types';
import { useUserButtonController } from './user-button.controller';
import type { UserButtonModelOptions } from './user-button.model';
import { useUserButtonModel } from './user-button.model';
import type { OrganizationProfilePageId } from './user-button.pages';
import { useCustomPages, useOrganizationProfilePages, useUserProfilePages } from './user-button.pages';
import type { UserButtonMenuProps, UserButtonModeProps } from './user-button.types';
import type { UserButtonTriggerProps } from './user-button.view';
import { UserButtonView } from './user-button.view';

/** What a profile opened by `<UserButton />` takes beyond the profile component's own props. */
export interface UserButtonProfilePages<PageId extends string> {
  /**
   * Provide custom pages and links to be rendered inside the profile.
   */
  customPages?: CustomProfileItem[];
  /**
   * Controls the order of the profile's navigation. Accepts the ids of built-in pages and the
   * `path` of custom pages. Pages not listed are placed after the listed ones. The first entry is
   * the page the profile opens on, so it cannot be a link.
   *
   * @default undefined
   */
  pageOrder?: (PageId | (string & {}))[];
}

/** Options for the underlying `<UserProfile />` component. */
export interface UserButtonUserProfileProps
  extends
    UserButtonProfilePages<UserProfilePageId>,
    Pick<UserProfileProps, 'additionalOAuthScopes' | 'apiKeysProps' | 'appearance'> {}

/** Options for the underlying `<OrganizationProfile />` component. */
export interface UserButtonOrganizationProfileProps
  extends UserButtonProfilePages<OrganizationProfilePageId>, Pick<OrganizationProfileProps, 'appearance'> {}

/** Everything `<UserButton />` takes: profile routing, trigger content, the app's own menu rows, and the profiles it opens. */
export type UserButtonProps = UserButtonModelOptions &
  UserButtonTriggerProps &
  UserButtonMenuProps &
  UserButtonModeProps & {
    /**
     * Specify options for the underlying <UserProfile /> component.
     * e.g., <UserButton userProfileProps={{additionalOAuthScopes: {google: ['foo', 'bar'], github: ['qux']}}} />
     */
    userProfileProps?: UserButtonUserProfileProps;
    /**
     * Specify options for the underlying <OrganizationProfile /> component.
     * e.g., <UserButton organizationProfileProps={{appearance: {...}}} />
     */
    organizationProfileProps?: UserButtonOrganizationProfileProps;
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
 * import { UserButton } from '@clerk/ui/mosaic';
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
 * `customPages` adds your own pages to either profile this button opens; `customMenuItems` adds your
 * own rows to the foot of the menu, each one either an `onClick` action or an `href` link.
 * ```tsx
 * <UserButton
 *   userProfileProps={{
 *     customPages: [{ path: 'usage', label: 'Usage', icon: <ChartIcon />, content: <UsagePage /> }],
 *     pageOrder: ['account', 'usage', 'security'],
 *   }}
 *   organizationProfileProps={{
 *     customPages: [{ path: 'audit', label: 'Audit log', icon: <ListIcon />, content: <AuditPage /> }],
 *     pageOrder: ['general', 'members', 'audit'],
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
    organizationProfileProps,
    customMenuItems,
    menuItemOrder,
    fallback,
    ...options
  } = props;
  // The portals must outlive the popover, so custom pages are bridged here rather than inside it.
  const userProfile = useCustomPages({
    items: userProfileProps?.customPages,
    order: userProfileProps?.pageOrder,
    builtInPages: useUserProfilePages(),
  });
  const organizationProfile = useCustomPages({
    items: organizationProfileProps?.customPages,
    order: organizationProfileProps?.pageOrder,
    builtInPages: useOrganizationProfilePages(),
  });
  const portals = (
    <>
      {userProfile.portals}
      {organizationProfile.portals}
    </>
  );
  const model = useUserButtonModel(options, {
    userProfile: {
      customPages: userProfile.customPages,
      additionalOAuthScopes: userProfileProps?.additionalOAuthScopes,
      apiKeysProps: userProfileProps?.apiKeysProps,
      appearance: userProfileProps?.appearance,
    },
    organizationProfile: {
      customPages: organizationProfile.customPages,
      appearance: organizationProfileProps?.appearance,
    },
  });
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
