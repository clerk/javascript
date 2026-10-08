import { useOrganization } from '@clerk/shared/react';

import { useProtect } from '@/common';
import { useEnvironment } from '@/contexts';

export const useOrganizationGeneralPageModel = () => ({
  canReadDomains: useProtect({ permission: 'org:sys_domains:read' }),
});

export const useOrganizationProfileSectionModel = () => {
  const { organization } = useOrganization();
  const canManageProfile = useProtect({ permission: 'org:sys_profile:manage' });

  return {
    available: Boolean(organization),
    canManageProfile,
    organization: organization
      ? {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          imageUrl: organization.imageUrl,
          hasImage: organization.hasImage,
        }
      : null,
  };
};

export const useOrganizationDomainsSectionModel = () => {
  const { organizationSettings } = useEnvironment();
  const { organization, domains } = useOrganization({ domains: { infinite: true } });
  const canManageDomains = useProtect({ permission: 'org:sys_domains:manage' });

  return {
    visible: Boolean(
      organizationSettings &&
      organization &&
      organizationSettings.domains.enabled &&
      (domains?.data?.length || canManageDomains),
    ),
    canManageDomains,
  };
};

export const useOrganizationLeaveSectionModel = () => {
  const { organization } = useOrganization();
  return { visible: Boolean(organization) };
};

export const useOrganizationDeleteSectionModel = () => {
  const { organization } = useOrganization();
  const canDeleteOrganization = useProtect({ permission: 'org:sys_profile:delete' });

  return { visible: Boolean(organization && canDeleteOrganization && organization.adminDeleteEnabled) };
};
