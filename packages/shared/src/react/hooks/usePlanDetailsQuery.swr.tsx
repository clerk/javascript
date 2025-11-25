import { useSWR } from '../clerk-swr';
import { useClerkInstanceContext } from '../contexts';
import { usePlanDetailsQueryCacheKeys } from './usePlanDetailsQuery.shared';
import type { PlanDetailsQueryResult, UsePlanDetailsQueryParams } from './usePlanDetailsQuery.types';

/**
 * This is the existing implementation of usePlanDetailsQuery using SWR.
 * It is kept here for backwards compatibility until our next major version.
 *
 * @internal
 */
function usePlanDetailsQuery(params: UsePlanDetailsQueryParams = {}): PlanDetailsQueryResult {
  const { planId, initialPlan = null, enabled = true, keepPreviousData = true } = params;
  const clerk = useClerkInstanceContext();

  const targetPlanId = planId ?? initialPlan?.id ?? null;

  const { queryKey } = usePlanDetailsQueryCacheKeys({ planId: targetPlanId });

  const queryEnabled = Boolean(targetPlanId) && enabled;

  const swr = useSWR(
    queryEnabled ? queryKey : null,
    () => {
      if (!targetPlanId) {
        throw new Error('planId is required to fetch plan details');
      }
      return clerk.billing.getPlan({ id: targetPlanId });
    },
    {
      dedupingInterval: 1_000 * 60,
      keepPreviousData,
      fallbackData: initialPlan ?? undefined,
    },
  );

  return {
    data: swr.data,
    error: (swr.error ?? null) as PlanDetailsQueryResult['error'],
    isLoading: swr.isLoading,
    isFetching: swr.isValidating,
  };
}

export { usePlanDetailsQuery as __internal_usePlanDetailsQuery };
