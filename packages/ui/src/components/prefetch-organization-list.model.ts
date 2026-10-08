import { useOrganizationList } from '@clerk/shared/react';

import { organizationListParams } from './OrganizationSwitcher/utils';

export const useOrganizationSwitcherPrefetchModel = () => {
  useOrganizationList(organizationListParams);
};
