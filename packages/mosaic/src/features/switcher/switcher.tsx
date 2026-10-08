'use client';

import type { OrganizationProfileProps, UserProfileProps } from '@clerk/shared/types';
import type { ReactElement, ReactNode } from 'react';

import type { CustomProfileItem, UserProfilePageId } from '../user-profile/user-profile.types';
import { useSwitcherController } from './switcher.controller';
import type { SwitcherModelOptions } from './switcher.model';
import { useSwitcherModel } from './switcher.model';
import type { OrganizationProfilePageId } from './switcher.pages';
import { useCustomPages, useOrganizationProfilePages, useUserProfilePages } from './switcher.pages';
import type { SwitcherMenuProps, SwitcherMode } from './switcher.types';
import type { SwitcherTriggerProps } from './switcher.view';
import { SwitcherView } from './switcher.view';

/** What a profile opened from the switcher takes beyond the profile component's own props. */
export interface SwitcherProfilePages<PageId extends string> {
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
export interface SwitcherUserProfileProps
  extends
    SwitcherProfilePages<UserProfilePageId>,
    Pick<UserProfileProps, 'additionalOAuthScopes' | 'apiKeysProps' | 'appearance'> {}

/** Options for the underlying `<OrganizationProfile />` component. */
export interface SwitcherOrganizationProfileProps
  extends SwitcherProfilePages<OrganizationProfilePageId>, Pick<OrganizationProfileProps, 'appearance'> {}

export type SwitcherProps = SwitcherModelOptions &
  SwitcherTriggerProps &
  SwitcherMenuProps & {
    /**
     * Specify options for the underlying <UserProfile /> component.
     * e.g., <UserButton userProfileProps={{additionalOAuthScopes: {google: ['foo', 'bar'], github: ['qux']}}} />
     */
    userProfileProps?: SwitcherUserProfileProps;
    /**
     * Specify options for the underlying <OrganizationProfile /> component.
     * e.g., organizationProfileProps={{appearance: {...}}}
     */
    organizationProfileProps?: SwitcherOrganizationProfileProps;
    /**
     * Fallback while loading.
     *
     * Note that the component renders nothing when the user is signed out, so using this on
     * pages that are reachable while both signed-out and signed-in can result in Fallback->Nothing.
     */
    fallback?: ReactNode;
  };

export function Switcher(props: SwitcherProps & { mode: SwitcherMode }): ReactElement | null {
  const {
    renderTriggerLabel,
    renderTriggerBadge,
    mode,
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
  const model = useSwitcherModel(options, {
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
  const controller = useSwitcherController(model, { mode, customMenuItems, menuItemOrder });

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
      <SwitcherView
        {...viewController}
        renderTriggerLabel={renderTriggerLabel}
        renderTriggerBadge={renderTriggerBadge}
      />
      {portals}
    </>
  );
}
