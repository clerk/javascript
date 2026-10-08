import { __internal_useOrganizationBase } from '@clerk/shared/react/index';

import { useEnvironment } from '@/contexts';
import { useAppearance } from '@/customizables';

export const useConfigureSSONavbarModel = () => {
  const { parsedOptions } = useAppearance();
  const {
    organizationSettings,
    displayConfig: { applicationName, logoImageUrl },
  } = useEnvironment();

  return {
    hasLogo: Boolean(parsedOptions.logoImageUrl || logoImageUrl),
    applicationName,
    organizationEnabled: organizationSettings.enabled,
  };
};

export const useConfigureSSOOrganizationSubtitleModel = () => {
  const organization = __internal_useOrganizationBase();
  return { hasOrganization: Boolean(organization), organizationName: organization?.name };
};
