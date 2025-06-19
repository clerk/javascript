import type { CommercePaymentResource, GetPaymentAttemptsParams } from '@clerk/types';

import { useClerkInstanceContext } from '../contexts';
import { createCommerceHook } from './createCommerceHook';

/**
 * @interface
 */
export type UsePaymentAttemptsParams = Parameters<ReturnType<typeof createCommerceHook>>[0];

/**
 *
 */
export const usePaymentAttempts = createCommerceHook<CommercePaymentResource, GetPaymentAttemptsParams>({
  hookName: 'usePaymentAttempts',
  resourceType: 'commerce-payment-attempts',
  useFetcher: () => {
    const clerk = useClerkInstanceContext();
    return clerk.billing.getPaymentAttempts;
  },
});
