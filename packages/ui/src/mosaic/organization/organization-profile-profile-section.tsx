import type { ReactElement } from 'react';

import { useOrganizationProfileProfileSectionController } from './organization-profile-profile-section.controller';
import { OrganizationProfileProfileSectionView } from './organization-profile-profile-section.view';

export function OrganizationProfileProfileSection(): ReactElement | null {
  const controller = useOrganizationProfileProfileSectionController();
  if (controller.status !== 'ready') {
    return null;
  }
  return (
    <OrganizationProfileProfileSectionView
      snapshot={controller.details.snapshot}
      send={controller.details.send}
      canSubmit={controller.details.canSubmit}
    />
  );
}
