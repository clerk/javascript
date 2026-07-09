import type { ReactElement } from 'react';

import { OrganizationProfileDeleteSection } from './organization-profile-delete-section';
import { OrganizationProfileGeneralPanelView } from './organization-profile-general-panel-view';
import { OrganizationProfileLeaveSection } from './organization-profile-leave-section';

export function OrganizationProfileGeneralPanel(): ReactElement {
  return (
    <OrganizationProfileGeneralPanelView
      leaveOrganization={<OrganizationProfileLeaveSection />}
      deleteOrganization={<OrganizationProfileDeleteSection />}
    />
  );
}
