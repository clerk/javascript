import { useState } from 'react';

import { organizationProfilePageIds } from '../organization-profile/organization-profile.layout';
import {
  getAvailableUserProfilePages,
  ORGANIZATION_PAGE_PREFIX,
  resolveUserProfilePages,
  withoutOrganizationPaths,
} from './user-profile.layout';
import type { UserProfileViewProps } from './user-profile.view';

type UserProfileControllerOptions = Pick<UserProfileViewProps, 'pages' | 'customPages' | 'pageOrder'> & {
  initialPage: UserProfileViewProps['activePage'];
  organization?:
    | { status: 'loading' | 'hidden' }
    | { status: 'ready'; pageList: NonNullable<UserProfileViewProps['organization']> };
};

export function useUserProfileController({
  initialPage,
  pages,
  customPages,
  pageOrder,
  organization,
}: UserProfileControllerOptions) {
  const [activePage, setActivePage] = useState(initialPage);

  if (organization && organization.status !== 'loading' && activePage.startsWith(ORGANIZATION_PAGE_PREFIX)) {
    const organizationPageIds =
      organization.status === 'ready'
        ? organizationProfilePageIds(organization.pageList).map(id => `${ORGANIZATION_PAGE_PREFIX}${id}`)
        : [];
    if (!organizationPageIds.includes(activePage)) {
      setActivePage(
        resolveUserProfilePages(
          getAvailableUserProfilePages(pages),
          withoutOrganizationPaths(customPages),
          pageOrder,
        )[0]?.id ?? 'account',
      );
    }
  }

  return { activePage, onPageChange: setActivePage };
}
