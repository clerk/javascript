import { __internal_useOrganizationEnterpriseConnections } from '@clerk/shared/react';

import { useProtect } from '../../common';
import { useOrganizationProfileContext } from '../../contexts';

export const useSecurityRouteAccess = (): boolean => {
  const { shouldShowSelfServeSSO } = useOrganizationProfileContext();
  const canManageConnections = useProtect({ permission: 'org:sys_entconns:manage' });
  const canManageSSOBypass = useProtect({ permission: 'org:sys_entconns_sso_bypass:manage' });
  const canConfigureSso = shouldShowSelfServeSSO && canManageConnections;

  const { data: enterpriseConnections } = __internal_useOrganizationEnterpriseConnections({
    enabled: canManageSSOBypass && !canConfigureSso,
  });

  return canConfigureSso || (canManageSSOBypass && (enterpriseConnections?.length ?? 0) > 0);
};
