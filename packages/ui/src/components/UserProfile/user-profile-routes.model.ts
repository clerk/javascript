import { USER_PROFILE_NAVBAR_ROUTE_ID } from '@/ui/constants';
import { useEnvironment, useUserProfileContext } from '@/ui/contexts';

import type { UserProfileRoutesData } from './profile-sections.types';

export const useUserProfileRoutesModel = (): UserProfileRoutesData => {
  const { pages, shouldShowBilling, apiKeysProps } = useUserProfileContext();
  const { apiKeysSettings, commerceSettings } = useEnvironment();

  return {
    isAccountPageRoot: pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.ACCOUNT,
    isSecurityPageRoot: pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.SECURITY,
    isBillingPageRoot: pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.BILLING,
    isAPIKeysPageRoot: pages.routes[0].id === USER_PROFILE_NAVBAR_ROUTE_ID.API_KEYS,
    customPages: pages.contents,
    showBilling: commerceSettings.billing.user.enabled && shouldShowBilling,
    hasPaidPlans: commerceSettings.billing.user.hasPaidPlans,
    showAPIKeys: apiKeysSettings.user_api_keys_enabled && !apiKeysProps?.hide,
  };
};
