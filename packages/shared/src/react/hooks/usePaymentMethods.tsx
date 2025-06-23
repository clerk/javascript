import type { CommercePaymentSourceResource, GetPaymentSourcesParams } from '@clerk/types';

import { useOrganizationContext, useUserContext } from '../contexts';
import { createCommerceHook } from './createCommerceHook';

/**
 * @internal
 */
export type UsePaymentMethodsParams = Parameters<ReturnType<typeof createCommerceHook>>[0];

/**
 * @internal
 */
export const usePaymentMethods = createCommerceHook<CommercePaymentSourceResource, GetPaymentSourcesParams>({
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
