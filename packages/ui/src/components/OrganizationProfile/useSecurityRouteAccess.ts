import { __internal_useOrganizationEnterpriseConnections } from '@clerk/shared/react';

import { useSecurityCapabilities } from './useSecurityCapabilities';

export type SecurityRouteAccess = {
  allowed: boolean;
  pending: boolean;
};

export const useSecurityRouteAccess = (): SecurityRouteAccess => {
  const { canConfigureSso, canConfigureDirectorySync, canManageSSOBypass } = useSecurityCapabilities();
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
