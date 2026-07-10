import type { ReactElement } from 'react';

import { useOrganizationProfileMembersPanelController } from './organization-profile-members-panel.controller';
import { OrganizationProfileMembersPanelView } from './organization-profile-members-panel.view';

export function OrganizationProfileMembersPanel(): ReactElement | null {
  const controller = useOrganizationProfileMembersPanelController();
  if (controller.status !== 'ready') {
    return null;
  }
  return (
    <OrganizationProfileMembersPanelView
      snapshot={controller.snapshot}
      send={controller.send}
      rows={controller.rows}
      canManage={controller.canManage}
      page={controller.page}
      pageCount={controller.pageCount}
      isLoading={controller.isLoading}
      onPageChange={controller.onPageChange}
    />
  );
}
