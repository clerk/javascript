import { useOrganizationList } from '@clerk/shared/react';

import { organizationListParams } from './OrganizationSwitcher/utils';

export function OrganizationSwitcherPrefetch() {
  useOrganizationList(organizationListParams);
  return null;
}
