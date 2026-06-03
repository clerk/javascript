import type { ReactNode } from 'react';

import { OrganizationDeleteSection } from '../../components/OrganizationProfile/OrganizationGeneralPage';
import { useRequirePage } from '../useRequirePage';

export function GeneralDeleteOrganization(): ReactNode {
  if (!useRequirePage('GeneralDeleteOrganization')) return null;
  return <OrganizationDeleteSection />;
}
