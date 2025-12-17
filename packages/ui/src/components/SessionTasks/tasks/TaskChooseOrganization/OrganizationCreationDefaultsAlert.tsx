import type { OrganizationCreationAdvisoryType, OrganizationCreationDefaultsResource } from '@clerk/shared/types';

import { type LocalizationKey, localizationKeys } from '@/localization';
import { Alert } from '@/ui/elements/Alert';

export function OrganizationCreationDefaultsAlert({
  organizationCreationDefaults,
}: {
  organizationCreationDefaults: OrganizationCreationDefaultsResource;
}) {
  if (!organizationCreationDefaults.advisory) {
    return null;
  }

  return (
    <Alert
      variant='warning'
      title={advisoryTypeToLocalizationKey[organizationCreationDefaults.advisory.type]}
    />
  );
}

const advisoryTypeToLocalizationKey: Record<OrganizationCreationAdvisoryType, LocalizationKey> = {
  existing_org_with_domain: localizationKeys('taskChooseOrganization.alerts.existingOrgWithDomain'),
};
