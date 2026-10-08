import { useOrganization } from '@clerk/shared/react';

import { useProtect } from '../../common';
import { useEnvironment } from '../../contexts';
import { toConfigureSSOModel } from '../ConfigureSSO/configure-sso.model';
import { useOrganizationEnterpriseConnection } from '../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';

export const useOrganizationSecurityPageGuardModel = () => {
  const { organization } = useOrganization();
  return { hasOrganization: !!organization };
};

export const useOrganizationSecurityPageModel = () => {
  const canManageConnections = useProtect({ permission: 'org:sys_entconns:manage' });
  const canManageSSOBypass = useProtect({ permission: 'org:sys_entconns_sso_bypass:manage' });
  const source = useOrganizationEnterpriseConnection({ manage: canManageConnections });
  const connections = toConfigureSSOModel(source);
  const { userSettings } = useEnvironment();

  return {
    ...connections,
    canManageConnections,
    showDirectorySync: canManageConnections && userSettings.enterpriseSSO.self_serve_directory_sync,
    showSSOBypass: canManageSSOBypass && connections.enterpriseConnections.length > 0,
  };
};
