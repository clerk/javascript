import { eventMethodCalled } from '../../telemetry/events';
import { useSWR } from '../clerk-swr';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';
import type { PlanDetailsQueryResult, UsePlanDetailsQueryParams } from './usePlanDetailsQuery.types';
import { usePlanDetailsQueryCacheKeys } from './usePlanDetailsQuery.shared';

const HOOK_NAME = 'usePlanDetailsQuery';

/**
 * This is the existing implementation of usePlanDetailsQuery using SWR.
 * It is kept here for backwards compatibility until our next major version.
 *
 * @internal
 */
export function __internal_usePlanDetailsQuery(params: UsePlanDetailsQueryParams = {}): PlanDetailsQueryResult {
  useAssertWrappedByClerkProvider(HOOK_NAME);

  const { planId, initialPlan = null, enabled = true, keepPreviousData = true } = params;
  const clerk = useClerkInstanceContext();

  clerk.telemetry?.record(eventMethodCalled(HOOK_NAME));

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
