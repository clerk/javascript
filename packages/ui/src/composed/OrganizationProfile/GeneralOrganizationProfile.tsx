import type { ReactNode } from 'react';

import { OrganizationProfileSection } from '../../components/OrganizationProfile/OrganizationGeneralPage';
import { useRequirePage } from '../useRequirePage';

export function GeneralOrganizationProfile(): ReactNode {
  if (!useRequirePage('GeneralOrganizationProfile')) return null;
  return <OrganizationProfileSection />;
}
