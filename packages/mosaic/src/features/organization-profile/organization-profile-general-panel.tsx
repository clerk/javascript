import type { ReactNode } from 'react';

import { OrganizationProfileDangerSection } from './organization-profile-danger-section/organization-profile-danger-section';
import { OrganizationProfileGeneralPanelView } from './organization-profile-general-panel.view';
import { OrganizationProfileProfileSection } from './organization-profile-profile-section/organization-profile-profile-section';

export interface OrganizationProfileGeneralPanelProps {
  children?: ReactNode;
}

export function OrganizationProfileGeneralPanel({ children }: OrganizationProfileGeneralPanelProps) {
  return (
    <OrganizationProfileGeneralPanelView>
      {children ?? (
        <>
          <OrganizationProfileProfileSection />
          <OrganizationProfileDangerSection />
        </>
      )}
    </OrganizationProfileGeneralPanelView>
  );
}
