import type { OrganizationCreationDefaultsResource } from '@clerk/shared/types';

import { Alert, Text } from '@/customizables';
import { localizationKeys } from '@/localization';

export function OrganizationCreationDefaultsAlert({
  organizationCreationDefaults,
}: {
  organizationCreationDefaults?: OrganizationCreationDefaultsResource;
}) {
  const localizationKey = advisoryToLocalizationKey(organizationCreationDefaults?.advisory);
  if (!localizationKey) {
    return null;
  }

  return (
    <Alert colorScheme='warning'>
      <Text
        colorScheme='warning'
        localizationKey={localizationKey}
        variant='caption'
      />
    </Alert>
  );
}

const advisoryToLocalizationKey = (advisory?: OrganizationCreationDefaultsResource['advisory']) => {
  if (!advisory) {
    return null;
  }

  switch (advisory.code) {
    case 'organization_already_exists':
      return localizationKeys('taskChooseOrganization.alerts.organizationAlreadyExists', {
        organizationDomain: advisory.meta.organization_domain,
        organizationName: advisory.meta.organization_name,
      });
    default:
      return null;
  }
};
