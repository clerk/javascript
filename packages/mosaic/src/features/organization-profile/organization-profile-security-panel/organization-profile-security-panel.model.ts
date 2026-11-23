import { __internal_useOrganizationEnterpriseConnections } from '@clerk/shared/react';

import type { SecurityCapabilities } from './organization-profile-security-panel-access.model';
import { useSSOBypassAvailabilityModel } from './sso-bypass.model';
import { useConnectionsStatus } from './use-connections-status';

export interface SecurityPanelModel {
  isLoading: boolean;
  showSSOBypass: boolean;
  isConnectionsError: boolean;
  isRetryingConnections: boolean;
  retryConnections: () => void;
}

export function useSecurityPanelModel({ canManageSSOBypass }: SecurityCapabilities): SecurityPanelModel {
  const connections = __internal_useOrganizationEnterpriseConnections({ enabled: canManageSSOBypass });
  const connectionsStatus = useConnectionsStatus(connections);
  const isConnectionsError = canManageSSOBypass && connectionsStatus.isError;
  const hasConnections = (connections.data?.length ?? 0) > 0;
  const bypass = useSSOBypassAvailabilityModel({ enabled: canManageSSOBypass && hasConnections });

  return {
    isLoading: canManageSSOBypass && connectionsStatus.isLoading,
    showSSOBypass: canManageSSOBypass && hasConnections && !bypass.isFeatureDisabled,
    isConnectionsError,
    isRetryingConnections: isConnectionsError && connections.isFetching,
    retryConnections: () => void connections.revalidate(),
  };
}
