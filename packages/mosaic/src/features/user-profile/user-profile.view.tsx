import { logger } from '@clerk/shared/logger';
import React from 'react';

import { Icon } from '../../components/icon';
import { useMessages } from '../../localization';
import type { OrganizationProfilePageId } from '../organization-profile/organization-profile.types';
import type { OrganizationProfilePageListOptions } from '../organization-profile/organization-profile.view';
import { organizationProfilePageList } from '../organization-profile/organization-profile.view';
import type { ProfilePage, ProfilePageGroup, ProfilePagesViewProps } from '../profile-pages/profile-pages.view';
import { ProfilePagesView } from '../profile-pages/profile-pages.view';
import {
  getAvailableUserProfilePages,
  ORGANIZATION_PAGE_PREFIX,
  resolveUserProfilePages,
  USER_PROFILE_PAGE_ICONS,
} from './user-profile.layout';
import type { CustomProfilePage, UserProfilePageId, UserProfilePages } from './user-profile.types';

export interface UserProfileViewProps extends Omit<
  ProfilePagesViewProps,
  'label' | 'groups' | 'activePage' | 'onPageChange'
> {
  /** Names the surface, and the dialog it opens in. Defaults to the `userProfile.label` message. */
  label?: string;
  /**
   * The open page: a built-in page's id, or a custom page's `path`. An organization page's id is
   * prefixed with `organization.`.
   */
  activePage: UserProfilePageId | `organization.${OrganizationProfilePageId}` | (string & {});
  pages: UserProfilePages;
  /** Pages of the consumer's own, added to the navigation after the built-ins. */
  customPages?: readonly CustomProfilePage[];
  /**
   * The order the navigation runs in, by id: a built-in page's id, or a custom page's `path`. Ids
   * left out keep their default place behind the ones named.
   */
  pageOrder?: readonly (UserProfilePageId | (string & {}))[];
  /** Adds the organization's pages, in a group of their own. */
  organization?: OrganizationProfilePageListOptions;
  onPageChange: (page: UserProfileViewProps['activePage']) => void;
}

/**
 * The user profile as a `Profile`: the built-in pages the instance has content for, the
 * consumer's own pages after them, in the order asked for, and the organization's pages in a group
 * after those when there is one. An `activePage` the navigation does not list falls back to the
 * first one, so a page turned off by the environment cannot leave the surface blank.
 */
export const UserProfileView = React.forwardRef<HTMLDivElement, UserProfileViewProps>(function UserProfileView(
  { pages, customPages, pageOrder, organization, label, ...rest },
  ref,
) {
  const m = useMessages('userProfile');
  const organizationLabels = useMessages('organizationProfile').pages;
  const accountPages = userProfilePageList({ pages, customPages, pageOrder }, m.pages);
  const groups: ProfilePageGroup[] = organization
    ? [
        { label: m.accountGroup, pages: accountPages },
        {
          label: m.organizationGroup,
          pages: organizationProfilePageList(organization, organizationLabels).map(page => ({
            ...page,
            id: `${ORGANIZATION_PAGE_PREFIX}${page.id}`,
          })),
        },
      ]
    : [{ pages: accountPages }];
  if (accountPages.length === 0) {
    logger.warnOnce('[Clerk] UserProfile has no pages to show.');
  }

  return (
    <ProfilePagesView
      ref={ref}
      label={label ?? m.label}
      groups={groups}
      {...rest}
    />
  );
});

/** The account's navigation, in order: the built-ins it was given content for, then the consumer's pages. */
function userProfilePageList(
  { pages, customPages, pageOrder }: Pick<UserProfileViewProps, 'pages' | 'customPages' | 'pageOrder'>,
  labels: Record<UserProfilePageId, string>,
): ProfilePage[] {
  return resolveUserProfilePages(getAvailableUserProfilePages(pages), customPages, pageOrder).map(entry =>
    entry.custom
      ? { id: entry.id, label: entry.custom.label, icon: entry.custom.icon, content: entry.custom.content }
      : {
          id: entry.id,
          label: labels[entry.id],
          icon: (
            <Icon
              glyph={USER_PROFILE_PAGE_ICONS[entry.id]}
              size='sm'
            />
          ),
          content: pages[entry.id],
        },
  );
}
