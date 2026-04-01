import type { BillingPaymentMethodResource, GetPaymentMethodsParams } from '../../types';
import { STABLE_KEYS } from '../stable-keys';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useUserBase } from './base/useUserBase';
import { createBillingPaginatedHook } from './createBillingPaginatedHook';

/**
 * @internal
 */
export const usePaymentMethods = createBillingPaginatedHook<BillingPaymentMethodResource, GetPaymentMethodsParams>({
  hookName: 'usePaymentMethods',
  resourceType: STABLE_KEYS.PAYMENT_METHODS_KEY,
  useFetcher: resource => {
    const organization = useOrganizationBase();
    const user = useUserBase();

    if (resource === 'organization') {
      return organization?.getPaymentMethods;
    }
    return user?.getPaymentMethods;
  },
});

/**
 * @interface
 */
export type UsePaymentMethodsReturn = ReturnType<typeof usePaymentMethods>;
