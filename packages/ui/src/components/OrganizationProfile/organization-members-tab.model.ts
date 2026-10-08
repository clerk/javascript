import { useProtect } from '@/common';
import { useEnvironment, useOrganizationProfileContext } from '@/contexts';

export const useOrganizationMembersTabModel = () => {
  const { organizationSettings } = useEnvironment();
  const { navigateToGeneralPageRoot } = useOrganizationProfileContext();
  const canManageDomains = useProtect({ permission: 'org:sys_domains:manage' });

  return {
    showDomainPanel: Boolean(organizationSettings?.domains?.enabled && canManageDomains),
    navigateToGeneralPageRoot,
  };
};
