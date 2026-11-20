import { useOrganization } from '@clerk/shared/react';
import type { ReactNode } from 'react';

import { useSecurityPanelModel } from './organization-profile-security-panel.model';
import {
  OrganizationProfileSecurityPanelEmptyState,
  OrganizationProfileSecurityPanelView,
} from './organization-profile-security-panel.view';
import type { SecurityCapabilities } from './organization-profile-security-panel-access.model';
import { useSecurityPanelAccessModel } from './organization-profile-security-panel-access.model';
import { SSOBypassSectionSkeleton } from './sso-bypass.skeleton';
import { SSOBypassConnectionsErrorView } from './sso-bypass.view';
import { SSOBypassSection } from './sso-bypass-section';
import { SSOSection } from './sso-section';

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
  return (
    <OrganizationProfileSecurityPanelView>
      {capabilities.canConfigureSso ? <SSOSection /> : null}
      {model.isLoading ? (
        <SSOBypassSectionSkeleton />
      ) : model.isConnectionsError ? (
        <SSOBypassConnectionsErrorView
          isRetrying={model.isRetryingConnections}
          onRetry={model.retryConnections}
        />
      ) : model.showSSOBypass ? (
        <SSOBypassSection />
      ) : capabilities.canConfigureSso ? null : (
        <OrganizationProfileSecurityPanelEmptyState />
      )}
    </OrganizationProfileSecurityPanelView>
  );
}
