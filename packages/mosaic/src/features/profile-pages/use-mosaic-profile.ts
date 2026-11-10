import { createContext, useContext } from 'react';

import type { OrganizationProfileProps } from '../organization-profile/organization-profile';
import type { OrganizationProfilePageId } from '../organization-profile/organization-profile.types';
import type { UserProfileProps } from '../user-profile/user-profile';
import type { CustomProfilePage, UserProfilePageId } from '../user-profile/user-profile.types';

export interface MosaicProfile {
  /**
   * Whether a menu that carries both the account and the organization opens one profile with both
   * groups of pages. `false` opens them as separate profiles. A menu that carries only one of them
   * always opens that one's profile. It is also the mode of a `<Profile />` without a `mode`:
   * `false` shows the account's pages alone.
   *
   * @default true
   */
  combined?: boolean;
  /**
   * Options for the user profile, whichever component opens or mounts it.
   */
  userProfileProps?: ProfileUserProps;
  /**
   * Options for the organization profile, or the organization's pages in a combined profile,
   * whichever component opens or mounts it.
   */
  organizationProfileProps?: ProfileOrganizationProps;
  /**
   * Full URL or path of your own user profile page. Setting it routes there instead of opening the modal.
   */
  userProfileUrl?: string;
  /**
   * Full URL or path of your own organization profile page. Setting it routes there instead of opening the modal.
   */
  organizationProfileUrl?: string;
}

/** What a profile takes beyond the profile component's own props. */
export interface ProfilePages<PageId extends string> {
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
export interface ProfileUserProps
  extends ProfilePages<UserProfilePageId>, Pick<UserProfileProps, 'additionalOAuthScopes' | 'apiKeysProps' | 'path'> {}

/** Options for the underlying `<OrganizationProfile />` component. */
export interface ProfileOrganizationProps
  extends
    ProfilePages<OrganizationProfilePageId>,
    Pick<OrganizationProfileProps, 'afterLeaveOrganizationUrl' | 'apiKeysProps' | 'path'> {}

const MosaicProfileContext = createContext<MosaicProfile>({});

export const MosaicProfileProvider = MosaicProfileContext.Provider;

export function useMosaicProfile(): MosaicProfile {
  return useContext(MosaicProfileContext);
}

/** What the user profile modal opens with, whichever path opens it. */
export function userProfileModalOptions({
  combined = true,
  userProfileProps,
  organizationProfileProps,
}: MosaicProfile) {
  return { ...userProfileProps, combined, organizationProfileProps };
}
