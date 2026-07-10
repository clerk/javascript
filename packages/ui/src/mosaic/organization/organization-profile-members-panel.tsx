import type { ReactElement } from 'react';

import { useOrganizationProfileMembersPanelController } from './organization-profile-members-panel.controller';
import { OrganizationProfileMembersPanelView } from './organization-profile-members-panel.view';

/**
 * The organization members panel: a searchable, paginated member list showing each
 * member's name, join date, and role, plus a Remove action for managers. Returns
 * `null` while the controller is not `ready` (permission gating and initial data
 * load); once ready it renders {@link OrganizationProfileMembersPanelView}. Self-gates
 * on membership read/manage permissions and requires a `MosaicProvider` ancestor.
 * Exposed on the compound namespace as `OrganizationProfile.MembersPanel`.
 */
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
