import { useOrganization } from '@clerk/shared/react';
import type { ReactNode } from 'react';

import { useSecurityPanelController } from './organization-profile-security-panel.controller';
import { useSecurityPanelModel } from './organization-profile-security-panel.model';
import { OrganizationProfileSecurityPanelView } from './organization-profile-security-panel.view';
import type { SecurityCapabilities } from './organization-profile-security-panel-access.model';
import { useSecurityPanelAccessModel } from './organization-profile-security-panel-access.model';
import { SSOBypassSectionSkeleton } from './sso-bypass.skeleton';
import { SSOBypassPage } from './sso-bypass-page';
import { SSOBypassSectionView } from './sso-bypass-section.view';

export interface OrganizationProfileSecurityPanelProps {
  fallback?: ReactNode;
}

export function OrganizationProfileSecurityPanel({ fallback }: OrganizationProfileSecurityPanelProps) {
  const access = useSecurityPanelAccessModel();
  const { organization } = useOrganization();
  if (access.status === 'loading') {
    return fallback ?? null;
  }
  if (access.status === 'hidden') {
    return null;
  }
  return (
    <SecurityPanel
      key={organization?.id}
      capabilities={access}
    />
  );
}

function SecurityPanel({ capabilities }: { capabilities: SecurityCapabilities }) {
  const model = useSecurityPanelModel(capabilities);
  const controller = useSecurityPanelController(model);
  const { ssoBypass } = model;

  return (
    <OrganizationProfileSecurityPanelView
      {...controller}
      overview={
        model.isLoading || ssoBypass?.isLoading ? (
          <SSOBypassSectionSkeleton />
        ) : ssoBypass && controller.onManageSSOBypass ? (
          <SSOBypassSectionView
            count={ssoBypass.count}
            isError={ssoBypass.isError}
            onManage={controller.onManageSSOBypass}
            manageRef={controller.manageSSOBypassRef}
          />
        ) : null
      }
      ssoBypass={<SSOBypassPage />}
    />
  );
}
