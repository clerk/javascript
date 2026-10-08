import { useEnvironment, useOrganizationProfileContext } from '@/ui/contexts';

import type { OrganizationProfileRoutesData } from './organization-navigation.types';
import { useSecurityRouteAccess } from './useSecurityRouteAccess';

export const useOrganizationProfileRoutesModel = (): OrganizationProfileRoutesData => {
  const {
    pages,
    isMembersPageRoot,
    isGeneralPageRoot,
    isBillingPageRoot,
    isAPIKeysPageRoot,
    isSecurityPageRoot,
    shouldShowBilling,
    shouldShowSecurityPage,
    apiKeysProps,
  } = useOrganizationProfileContext();
  const securityRouteAccess = useSecurityRouteAccess();
  const { apiKeysSettings, commerceSettings } = useEnvironment();

  return {
    customPages: pages.contents,
    isMembersPageRoot,
    isGeneralPageRoot,
    isBillingPageRoot,
    isAPIKeysPageRoot,
    isSecurityPageRoot,
    showBilling: commerceSettings.billing.organization.enabled && shouldShowBilling,
    hasPaidPlans: commerceSettings.billing.organization.hasPaidPlans,
    showAPIKeys: apiKeysSettings.orgs_api_keys_enabled && !apiKeysProps?.hide,
    showSecurity: shouldShowSecurityPage && (securityRouteAccess.allowed || securityRouteAccess.pending),
  };
};
