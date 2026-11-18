import { __internal_useOrganizationEnterpriseConnections } from '@clerk/shared/react';

import type { SecurityCapabilities } from './organization-profile-security-panel-access.model';
import { useSSOBypassAvailabilityModel } from './sso-bypass.model';

export interface SecurityPanelModel {
  isLoading: boolean;
  showSSOBypass: boolean;
}

export function useSecurityPanelModel({ canManageSSOBypass }: SecurityCapabilities): SecurityPanelModel {
  const connections = __internal_useOrganizationEnterpriseConnections({ enabled: canManageSSOBypass });
  const hasConnections = (connections.data?.length ?? 0) > 0;
  const bypass = useSSOBypassAvailabilityModel({ enabled: canManageSSOBypass && hasConnections });

  return {
    isLoading: canManageSSOBypass && connections.isLoading,
    showSSOBypass: canManageSSOBypass && hasConnections && !bypass.isFeatureDisabled,
  };
}
