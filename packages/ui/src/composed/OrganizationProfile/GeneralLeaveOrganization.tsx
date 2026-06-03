import type { ReactNode } from 'react';

import { OrganizationLeaveSection } from '../../components/OrganizationProfile/OrganizationGeneralPage';
import { useRequirePage } from '../useRequirePage';

export function GeneralLeaveOrganization(): ReactNode {
  if (!useRequirePage('GeneralLeaveOrganization')) return null;
  return <OrganizationLeaveSection />;
}
