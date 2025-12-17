import type { OrganizationCreationAdvisoryType, OrganizationCreationDefaultsResource } from '@clerk/shared/types';

import { type LocalizationKey, localizationKeys } from '@/localization';
import { Alert } from '@/ui/elements/Alert'; // or from '@/ui/elements'

export function OrganizationCreationDefaultsAlert({
  organizationCreationDefaults,
}: {
  organizationCreationDefaults: OrganizationCreationDefaultsResource;
}) {
  if (!organizationCreationDefaults.creationAdvisory) {
    return null;
  }

  return (
    <Alert
      variant='warning'
      title={advisoryTypeToLocalizationKey[organizationCreationDefaults.creationAdvisory.type]}
    />
  );
}

const advisoryTypeToLocalizationKey: Record<OrganizationCreationAdvisoryType, LocalizationKey> = {
  existing_org_with_domain: localizationKeys('taskChooseOrganization.alerts.existingOrgWithDomain'),
};
