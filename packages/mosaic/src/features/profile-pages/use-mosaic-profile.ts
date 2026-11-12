import { createContext, useContext } from 'react';

import type { OrganizationProfileProps } from '../organization-profile/organization-profile';
import type { OrganizationProfilePageId } from '../organization-profile/organization-profile.types';
import type { UserProfileProps } from '../user-profile/user-profile';
import type { CustomProfilePage, UserProfilePageId } from '../user-profile/user-profile.types';

export interface MosaicProfile {
  /**
   * Whether one profile carries the account's pages and the active organization's. `false` keeps them
   * in separate profiles. It decides the profile's shape, not what `UserButton`'s menu lists.
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
  extends
    ProfilePages<UserProfilePageId>,
    Pick<UserProfileProps, 'additionalOAuthScopes' | 'apiKeysProps' | 'path' | 'routing'> {}

/** Options for the underlying `<OrganizationProfile />` component. */
export interface ProfileOrganizationProps
  extends
    ProfilePages<OrganizationProfilePageId>,
    Pick<OrganizationProfileProps, 'afterLeaveOrganizationUrl' | 'apiKeysProps' | 'path' | 'routing'> {}

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
