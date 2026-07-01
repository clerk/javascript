import type { ReactElement } from 'react';

import { OrganizationProfileDeleteSection } from '../sections/organization-profile-delete-section';
import { OrganizationProfileLeaveSection } from '../sections/organization-profile-leave-section';
import { OrganizationProfileGeneralPanelView } from './organization-profile-general-panel-view';

export function OrganizationProfileGeneralPanel(): ReactElement {
  return (
    <OrganizationProfileGeneralPanelView
      leaveOrganization={<OrganizationProfileLeaveSection />}
      deleteOrganization={<OrganizationProfileDeleteSection />}
    />
  );
}
