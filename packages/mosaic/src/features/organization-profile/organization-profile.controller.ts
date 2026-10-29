import { useState } from 'react';

import { organizationProfilePageIds } from './organization-profile.layout';
import type { OrganizationProfilePageListOptions, OrganizationProfileViewProps } from './organization-profile.view';

type OrganizationProfileControllerOptions = Pick<OrganizationProfilePageListOptions, 'customPages' | 'pageOrder'> & {
  pages?: OrganizationProfilePageListOptions['pages'];
  defaultPage?: OrganizationProfileViewProps['activePage'];
};

export function useOrganizationProfileController({
  pages,
  customPages,
  pageOrder,
  defaultPage,
}: OrganizationProfileControllerOptions) {
  const [activePage, setActivePage] = useState<OrganizationProfileViewProps['activePage']>(
    defaultPage ?? pageOrder?.[0] ?? 'general',
  );

  if (pages) {
    const pageIds = organizationProfilePageIds({ pages, customPages, pageOrder });
    const firstPage = pageIds[0];
    if (firstPage !== undefined && !pageIds.includes(activePage)) {
      setActivePage(firstPage);
    }
  }

  return { activePage, onPageChange: setActivePage };
}
