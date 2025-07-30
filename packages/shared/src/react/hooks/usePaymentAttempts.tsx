import type { CommercePaymentResource, GetPaymentAttemptsParams } from '@clerk/types';

import { useClerkInstanceContext } from '../contexts';
import { createCommercePaginatedHook } from './createCommerceHook';

/**
 * @internal
 */
export const usePaymentAttempts = createCommercePaginatedHook<CommercePaymentResource, GetPaymentAttemptsParams>({
  hookName: 'usePaymentAttempts',
  resourceType: 'commerce-payment-attempts',
  useFetcher: () => {
    const clerk = useClerkInstanceContext();
    return clerk.billing.getPaymentAttempts;
  },
});
