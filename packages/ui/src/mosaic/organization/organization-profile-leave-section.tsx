import type { ReactElement } from 'react';

import { useOrganizationProfileLeaveSectionController } from './organization-profile-leave-section.controller';
import { OrganizationProfileLeaveSectionView } from './organization-profile-leave-section.view';

export function OrganizationProfileLeaveSection(): ReactElement | null {
  const controller = useOrganizationProfileLeaveSectionController();
  if (controller.status !== 'ready') {
    return null;
  }
  return (
    <OrganizationProfileLeaveSectionView
      snapshot={controller.snapshot}
      send={controller.send}
      canSubmit={controller.canSubmit}
    />
  );
}
