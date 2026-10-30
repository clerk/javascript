import type { OrganizationProfileProps, UserProfileProps } from '@clerk/shared/types';
import { createContext, useContext } from 'react';

import type { OrganizationProfilePageId } from '../switcher/switcher.pages';
import type { CustomProfileItem, UserProfilePageId } from '../user-profile/user-profile.types';

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
}

/** What a profile takes beyond the profile component's own props. */
export interface ProfilePages<PageId extends string> {
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
export interface ProfileUserProps
  extends
    ProfilePages<UserProfilePageId>,
    Pick<UserProfileProps, 'additionalOAuthScopes' | 'apiKeysProps' | 'appearance'> {}

/** Options for the underlying `<OrganizationProfile />` component. */
export interface ProfileOrganizationProps
  extends ProfilePages<OrganizationProfilePageId>, Pick<OrganizationProfileProps, 'appearance'> {}

const MosaicProfileContext = createContext<MosaicProfile>({});

export const MosaicProfileProvider = MosaicProfileContext.Provider;

export function useMosaicProfile(): MosaicProfile {
  return useContext(MosaicProfileContext);
}
