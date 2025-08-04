import type { CommercePaymentSourceResource, GetPaymentSourcesParams } from '@clerk/types';

import { useOrganizationContext, useUserContext } from '../contexts';
import { createCommercePaginatedHook } from './createCommerceHook';

/**
 * @internal
 */
export const usePaymentMethods = createCommercePaginatedHook<CommercePaymentSourceResource, GetPaymentSourcesParams>({
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
