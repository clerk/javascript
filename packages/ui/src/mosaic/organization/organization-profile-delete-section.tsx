import type { ReactElement } from 'react';

import { useOrganizationProfileDeleteSectionController } from './organization-profile-delete-section.controller';
import { OrganizationProfileDeleteSectionView } from './organization-profile-delete-section.view';

export function OrganizationProfileDeleteSection(): ReactElement | null {
  const controller = useOrganizationProfileDeleteSectionController();
  if (controller.status !== 'ready') {
    return null;
  }
  return (
    <OrganizationProfileDeleteSectionView
      snapshot={controller.snapshot}
      send={controller.send}
      canSubmit={controller.canSubmit}
    />
  );
}
