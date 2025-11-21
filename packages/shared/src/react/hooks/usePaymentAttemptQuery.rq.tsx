import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useClerkInstanceContext, useOrganizationContext, useUserContext } from '../contexts';
import { useBillingHookEnabled } from './useBillingHookEnabled';
import { usePaymentAttemptQueryCacheKeys } from './usePaymentAttemptQuery.shared';
import type { PaymentAttemptQueryResult, UsePaymentAttemptQueryParams } from './usePaymentAttemptQuery.types';

/**
 * This is the new implementation of usePaymentAttemptQuery using React Query.
 * It is exported only if the package is built with the `CLERK_USE_RQ` environment variable set to `true`.
 *
 * @internal
 */
function usePaymentAttemptQuery(params: UsePaymentAttemptQueryParams): PaymentAttemptQueryResult {
  const { paymentAttemptId, keepPreviousData = false, for: forType = 'user' } = params;
  const clerk = useClerkInstanceContext();
  const user = useUserContext();
  const { organization } = useOrganizationContext();

  const organizationId = forType === 'organization' ? (organization?.id ?? null) : null;
  const userId = user?.id ?? null;

  const { queryKey } = usePaymentAttemptQueryCacheKeys({
    paymentAttemptId,
    userId,
    orgId: organizationId,
    for: forType,
  });

  const billingEnabled = useBillingHookEnabled(params);

  const queryEnabled = Boolean(paymentAttemptId) && billingEnabled;

  const query = useClerkQuery({
    queryKey,
    queryFn: ({ queryKey }) => {
      const args = queryKey[3].args;
      return clerk.billing.getPaymentAttempt(args);
    },
    enabled: queryEnabled,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData),
    staleTime: 1_000 * 60,
  });

  return {
    data: query.data,
    error: (query.error ?? null) as PaymentAttemptQueryResult['error'],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}

export { usePaymentAttemptQuery as __internal_usePaymentAttemptQuery };
