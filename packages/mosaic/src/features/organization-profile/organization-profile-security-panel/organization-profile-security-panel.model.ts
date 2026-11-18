import { __internal_useOrganizationEnterpriseConnections } from '@clerk/shared/react';

import type { SecurityCapabilities } from './organization-profile-security-panel-access.model';
import { useSSOBypassCountModel } from './sso-bypass.model';

export interface SecurityPanelModel {
  isLoading: boolean;
  ssoBypass: { count: number; isLoading: boolean; isError: boolean } | undefined;
}

export function useSecurityPanelModel({ canManageSSOBypass }: SecurityCapabilities): SecurityPanelModel {
  const connections = __internal_useOrganizationEnterpriseConnections({ enabled: canManageSSOBypass });
  const hasConnections = (connections.data?.length ?? 0) > 0;
  const bypass = useSSOBypassCountModel({ enabled: canManageSSOBypass && hasConnections });

  return {
    isLoading: canManageSSOBypass && connections.isLoading,
    ssoBypass:
      canManageSSOBypass && hasConnections && !bypass.isFeatureDisabled
        ? { count: bypass.count, isLoading: bypass.isLoading, isError: bypass.isError }
        : undefined,
  };
}
