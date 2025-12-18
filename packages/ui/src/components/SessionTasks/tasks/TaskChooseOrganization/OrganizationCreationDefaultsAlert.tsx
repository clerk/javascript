import type { OrganizationCreationAdvisoryType, OrganizationCreationDefaultsResource } from '@clerk/shared/types';

import { Alert, Text } from '@/customizables';
import { type LocalizationKey, localizationKeys } from '@/localization';

export function OrganizationCreationDefaultsAlert({
  organizationCreationDefaults,
}: {
  organizationCreationDefaults?: OrganizationCreationDefaultsResource;
}) {
  if (!organizationCreationDefaults?.advisory) {
    return null;
  }

  return (
    <Alert colorScheme='warning'>
      <Text
        colorScheme='warning'
        localizationKey={advisoryTypeToLocalizationKey[organizationCreationDefaults.advisory.type]}
        variant='caption'
      />
    </Alert>
  );
}

// TODO -> Update with latest advisory where meta is returned
// TODO -> Include email domain in message, eg: {{ meta }}
const advisoryTypeToLocalizationKey: Record<OrganizationCreationAdvisoryType, LocalizationKey> = {
  existing_org_with_domain: localizationKeys('taskChooseOrganization.alerts.existingOrgWithDomain'),
};
