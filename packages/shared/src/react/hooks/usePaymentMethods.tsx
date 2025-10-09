import type { BillingPaymentSourceResource, GetPaymentSourcesParams } from '@clerk/types';

import { useOrganizationContext, useUserContext } from '../contexts';
import { createBillingPaginatedHook } from './createBillingPaginatedHook';

/**
 *
 */
export const usePaymentMethods = createBillingPaginatedHook<BillingPaymentSourceResource, GetPaymentSourcesParams>({
  hookName: 'usePaymentMethods',
  resourceType: 'commerce-payment-methods',
  useFetcher: resource => {
    const { organization } = useOrganizationContext();
    const user = useUserContext();

    if (resource === 'organization') {
      return organization?.getPaymentSources;
    }
    return user?.getPaymentSources;
  },
});

/**
 * @interface
 */
export type UsePaymentMethodsReturn = ReturnType<typeof usePaymentMethods>;
