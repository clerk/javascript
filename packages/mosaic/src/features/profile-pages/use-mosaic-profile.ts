import { createContext, useContext } from 'react';

import type { OrganizationProfileProps } from '../organization-profile/organization-profile';
import type { OrganizationProfilePageId } from '../switcher/switcher.pages';
import type { UserProfileProps } from '../user-profile/user-profile';
import type { CustomProfilePage, UserProfilePageId } from '../user-profile/user-profile.types';

export type MosaicProfile = MosaicProfileOptions & UserProfileRouting & OrganizationProfileRouting;

interface MosaicProfileOptions {
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

/** A URL is the whole opt-in to navigation, and `modal` forbids one, so the pair cannot contradict itself. */
type UserProfileRouting =
  | {
      /** Full URL or path of your own user profile page. Setting it routes there instead of opening the modal. */
      userProfileUrl: string;
      /** How the user profile opens: `modal` opens it in place, `navigation` goes to `userProfileUrl`. Follows from whether `userProfileUrl` is set. */
      userProfileMode?: 'navigation';
    }
  | {
      /** Full URL or path of your own user profile page. Setting it routes there instead of opening the modal. */
      userProfileUrl?: never;
      /** How the user profile opens: `modal` opens it in place, `navigation` goes to `userProfileUrl`. Follows from whether `userProfileUrl` is set. */
      userProfileMode?: 'modal';
    };

type OrganizationProfileRouting =
  | {
      /** Full URL or path of your own organization profile page. Setting it routes there instead of opening the modal. */
      organizationProfileUrl: string;
      /** How the organization profile opens: `modal` opens it in place, `navigation` goes to `organizationProfileUrl`. Follows from whether `organizationProfileUrl` is set. */
      organizationProfileMode?: 'navigation';
    }
  | {
      /** Full URL or path of your own organization profile page. Setting it routes there instead of opening the modal. */
      organizationProfileUrl?: never;
      /** How the organization profile opens: `modal` opens it in place, `navigation` goes to `organizationProfileUrl`. Follows from whether `organizationProfileUrl` is set. */
      organizationProfileMode?: 'modal';
    };

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
  extends ProfilePages<UserProfilePageId>, Pick<UserProfileProps, 'additionalOAuthScopes' | 'apiKeysProps'> {}

/** Options for the underlying `<OrganizationProfile />` component. */
export interface ProfileOrganizationProps
  extends
    ProfilePages<OrganizationProfilePageId>,
    Pick<OrganizationProfileProps, 'afterLeaveOrganizationUrl' | 'apiKeysProps'> {}

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
