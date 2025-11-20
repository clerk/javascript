import type { BillingPaymentResource, GetPaymentAttemptsParams } from '../../types';
import { useClerkInstanceContext } from '../contexts';
import { STABLE_KEYS } from '../stable-keys';
import { createBillingPaginatedHook } from './createBillingPaginatedHook';

/**
 * @internal
 */
export const usePaymentAttempts = createBillingPaginatedHook<BillingPaymentResource, GetPaymentAttemptsParams>({
  hookName: 'usePaymentAttempts',
  resourceType: STABLE_KEYS.PAYMENT_ATTEMPTS_KEY,
  useFetcher: () => {
    const clerk = useClerkInstanceContext();
    if (clerk.loaded) {
      return clerk.billing.getPaymentAttempts;
    }
    return undefined;
  },
});

/**
 * @interface
 */
export type UsePaymentAttemptsReturn = ReturnType<typeof usePaymentAttempts>;
