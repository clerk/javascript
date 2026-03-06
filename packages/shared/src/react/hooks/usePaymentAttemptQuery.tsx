import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useClerkInstanceContext } from '../contexts';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useUserBase } from './base/useUserBase';
import { useBillingIsEnabled } from './useBillingIsEnabled';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { usePaymentAttemptQueryCacheKeys } from './usePaymentAttemptQuery.shared';
import type { PaymentAttemptQueryResult, UsePaymentAttemptQueryParams } from './usePaymentAttemptQuery.types';

/**
 * @internal
 */
function usePaymentAttemptQuery(params: UsePaymentAttemptQueryParams): PaymentAttemptQueryResult {
  const { paymentAttemptId, keepPreviousData = false, for: forType = 'user' } = params;
  const clerk = useClerkInstanceContext();
  const user = useUserBase();
  const organization = useOrganizationBase();

  const organizationId = forType === 'organization' ? (organization?.id ?? null) : null;
  const userId = user?.id ?? null;

  const { queryKey, stableKey, authenticated } = usePaymentAttemptQueryCacheKeys({
    paymentAttemptId,
    userId,
    orgId: organizationId,
    for: forType,
  });

  const billingEnabled = useBillingIsEnabled(params);

  const queryEnabled = Boolean(paymentAttemptId) && billingEnabled;

  useClearQueriesOnSignOut({
    isSignedOut: user === null, // works with the transitive state
    authenticated,
    stableKeys: stableKey,
  });

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
