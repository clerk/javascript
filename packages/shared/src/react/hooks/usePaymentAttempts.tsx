import type { BillingPaymentResource, GetPaymentAttemptsParams } from '@clerk/types';

import { useClerkInstanceContext } from '../contexts';
import { createBillingPaginatedHook } from './createBillingPaginatedHook';

/**
 * @internal
 */
export const usePaymentAttempts = createBillingPaginatedHook<BillingPaymentResource, GetPaymentAttemptsParams>({
  hookName: 'usePaymentAttempts',
  resourceType: 'billing-payment-attempts',
  useFetcher: () => {
    const clerk = useClerkInstanceContext();
    if (clerk.loaded) {
      return clerk.billing.getPaymentAttempts;
    }
    return undefined;
  },
});
