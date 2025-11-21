import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useClerkInstanceContext } from '../contexts';
import { useBillingHookEnabled } from './useBillingHookEnabled';
import { usePlanDetailsQueryCacheKeys } from './usePlanDetailsQuery.shared';
import type { PlanDetailsQueryResult, UsePlanDetailsQueryParams } from './usePlanDetailsQuery.types';

/**
 * @internal
 */
export function __internal_usePlanDetailsQuery(params: UsePlanDetailsQueryParams = {}): PlanDetailsQueryResult {
  const { planId, initialPlan = null, keepPreviousData = true } = params;
  const clerk = useClerkInstanceContext();

  const targetPlanId = planId ?? initialPlan?.id ?? null;

  const { queryKey } = usePlanDetailsQueryCacheKeys({ planId: targetPlanId });

  const billingEnabled = useBillingHookEnabled({
    authenticated: false,
  });

  const queryEnabled = Boolean(targetPlanId) && billingEnabled;

  const query = useClerkQuery({
    queryKey,
    queryFn: () => {
      if (!targetPlanId) {
        throw new Error('planId is required to fetch plan details');
      }
      return clerk.billing.getPlan({ id: targetPlanId });
    },
    enabled: queryEnabled,
    initialData: initialPlan ?? undefined,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData),
    initialDataUpdatedAt: 0,
  });

  return {
    data: query.data,
    error: (query.error ?? null) as PlanDetailsQueryResult['error'],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}
