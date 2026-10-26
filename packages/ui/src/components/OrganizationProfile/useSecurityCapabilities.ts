import { useProtect } from '../../common';
import { useOrganizationProfileContext } from '../../contexts';

export type SecurityCapabilities = {
  canConfigureSso: boolean;
  canConfigureDirectorySync: boolean;
  canManageSSOBypass: boolean;
};

export const useSecurityCapabilities = (): SecurityCapabilities => {
  const { shouldShowSelfServeSSO, shouldShowSelfServeDirectorySync } = useOrganizationProfileContext();
  const canManageConnections = useProtect({ permission: 'org:sys_entconns:manage' });
  const canManageSSOBypass = useProtect({ permission: 'org:sys_entconns_sso_bypass:manage' });

  return {
    canConfigureSso: shouldShowSelfServeSSO && canManageConnections,
    canConfigureDirectorySync: shouldShowSelfServeDirectorySync && canManageConnections,
    canManageSSOBypass,
  };
};
