import type { BillingPaymentMethodResource, GetPaymentMethodsParams } from '../../types';
import { useOrganizationContext, useUserContext } from '../contexts';
import { createBillingPaginatedHook } from './createBillingPaginatedHook';

/**
 * @internal
 */
export const usePaymentMethods = createBillingPaginatedHook<BillingPaymentMethodResource, GetPaymentMethodsParams>({
  hookName: 'usePaymentMethods',
  resourceType: 'commerce-payment-methods',
  useFetcher: resource => {
    const { organization } = useOrganizationContext();
    const user = useUserContext();

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
