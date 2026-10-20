import { __internal_useOrganizationEnterpriseConnections } from '@clerk/shared/react';

import { useProtect } from '../../common';
import { useOrganizationProfileContext } from '../../contexts';

export type SecurityRouteAccess = {
  allowed: boolean;
  pending: boolean;
};

export const useSecurityRouteAccess = (): SecurityRouteAccess => {
  const { shouldShowSelfServeSSO, shouldShowSelfServeDirectorySync } = useOrganizationProfileContext();
  const canManageConnections = useProtect({ permission: 'org:sys_entconns:manage' });
  const canManageSSOBypass = useProtect({ permission: 'org:sys_entconns_sso_bypass:manage' });
  const canConfigureSso = shouldShowSelfServeSSO && canManageConnections;
  const canConfigureDirectorySync = shouldShowSelfServeDirectorySync && canManageConnections;
  const needsConnections = canManageSSOBypass && !canConfigureSso && !canConfigureDirectorySync;

  const { data: enterpriseConnections, isLoading } = __internal_useOrganizationEnterpriseConnections({
    enabled: needsConnections,
    keepPreviousData: false,
  });

  return {
    allowed:
      canConfigureSso || canConfigureDirectorySync || (canManageSSOBypass && (enterpriseConnections?.length ?? 0) > 0),
    pending: needsConnections && isLoading,
  };
};
