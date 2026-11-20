import { __internal_useOrganizationEnterpriseConnections, useOrganization, useSession } from '@clerk/shared/react';

import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { ORGANIZATION_PERMISSIONS } from '../../../utils/permissions';
import { useConnectionsStatus } from './use-connections-status';

export interface SecurityCapabilities {
  canConfigureSso: boolean;
  canConfigureDirectorySync: boolean;
  canManageSSOBypass: boolean;
}

export type SecurityPanelAccessModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | ({ status: 'ready' } & SecurityCapabilities);

export function useSecurityPanelAccessModel(): SecurityPanelAccessModel {
  const { isLoaded, organization } = useOrganization();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const environment = useMosaicEnvironment();

  const has = (permission: string) => session?.checkAuthorization({ permission }) ?? false;
  const enterpriseSSO = environment?.userSettings.enterpriseSSO;
  const selfServeSso = Boolean(enterpriseSSO?.self_serve_sso && organization?.selfServeSSOEnabled);
  const selfServeDirectorySync = Boolean(
    enterpriseSSO?.self_serve_sso &&
    enterpriseSSO?.self_serve_directory_sync &&
    organization?.selfServeDirectorySyncEnabled,
  );
  const canManageConnections = has(ORGANIZATION_PERMISSIONS.enterpriseConnectionsManage);
  const capabilities: SecurityCapabilities = {
    canConfigureSso: selfServeSso && canManageConnections,
    canConfigureDirectorySync: selfServeDirectorySync && canManageConnections,
    canManageSSOBypass: has(ORGANIZATION_PERMISSIONS.ssoBypassManage),
  };
  const needsConnections =
    capabilities.canManageSSOBypass && !capabilities.canConfigureSso && !capabilities.canConfigureDirectorySync;

  const connections = __internal_useOrganizationEnterpriseConnections({
    enabled: Boolean(organization) && needsConnections,
    keepPreviousData: false,
  });
  const connectionsStatus = useConnectionsStatus(connections);

  if (!isLoaded || !isSessionLoaded || !environment) {
    return { status: 'loading' };
  }
  if (!organization || !session) {
    return { status: 'hidden' };
  }
  if (needsConnections && connectionsStatus.isLoading) {
    return { status: 'loading' };
  }
  const allowed =
    capabilities.canConfigureSso ||
    capabilities.canConfigureDirectorySync ||
    (capabilities.canManageSSOBypass && (connectionsStatus.isError || (connections.data?.length ?? 0) > 0));

  return allowed ? { status: 'ready', ...capabilities } : { status: 'hidden' };
}
