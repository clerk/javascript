'use client';

import type { UserProfileProps } from '@clerk/shared/types';
import type { ReactElement, ReactNode } from 'react';

import type { OrganizationProfilePageId } from '../organization-profile/organization-profile.types';
import type { CustomProfilePage, UserProfilePageId } from '../user-profile/user-profile.types';
import { useSwitcherController } from './switcher.controller';
import type { SwitcherModelOptions } from './switcher.model';
import { useSwitcherModel } from './switcher.model';
import type { SwitcherMenuProps, SwitcherMode } from './switcher.types';
import type { SwitcherTriggerProps, SwitcherTriggerVariant } from './switcher.view';
import { SwitcherView } from './switcher.view';
import { surfaceForMode } from './switcher-surface';

/** What a profile opened from the switcher takes beyond the profile component's own props. */
export interface SwitcherProfilePages<PageId extends string> {
  /**
   * Provide custom pages to be rendered inside the profile.
   */
  customPages?: CustomProfilePage[];
  /**
   * Controls the order of the profile's navigation. Accepts the ids of built-in pages and the
   * `path` of custom pages. Pages not listed are placed after the listed ones. The first entry is
   * the page the profile opens on.
   *
   * @default undefined
   */
  pageOrder?: (PageId | (string & {}))[];
}

/** Options for the underlying `<UserProfile />` component. */
export interface SwitcherUserProfileProps
  extends SwitcherProfilePages<UserProfilePageId>, Pick<UserProfileProps, 'additionalOAuthScopes' | 'apiKeysProps'> {}

/** Options for the underlying `<OrganizationProfile />` component. */
export type SwitcherOrganizationProfileProps = SwitcherProfilePages<OrganizationProfilePageId>;

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
     * e.g., organizationProfileProps={{pageOrder: ['members', 'general']}}
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

export function Switcher(
  props: SwitcherProps & { mode: SwitcherMode; triggerVariant?: SwitcherTriggerVariant },
): ReactElement | null {
  const {
    renderTriggerLabel,
    renderTriggerBadge,
    triggerVariant,
    mode,
    userProfileProps,
    organizationProfileProps,
    customMenuItems,
    menuItemOrder,
    fallback,
    ...options
  } = props;
  const model = useSwitcherModel(options, {
    opener: surfaceForMode(mode),
    userProfile: { ...userProfileProps, mode: mode === 'combined' ? 'combined' : 'user' },
    organizationProfile: organizationProfileProps,
  });
  const controller = useSwitcherController(model, { mode, customMenuItems, menuItemOrder });

  if (controller.status === 'loading') {
    return <>{fallback}</>;
  }

  // Signed out is an answer, so the placeholder goes too rather than promising a button.
  if (controller.status === 'hidden') {
    return null;
  }

  const { status: _status, ...viewController } = controller;

  return (
    <SwitcherView
      {...viewController}
      renderTriggerLabel={renderTriggerLabel}
      renderTriggerBadge={renderTriggerBadge}
      triggerVariant={triggerVariant}
    />
  );
}
