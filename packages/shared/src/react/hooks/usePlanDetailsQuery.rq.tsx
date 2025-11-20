import { eventMethodCalled } from '../../telemetry/events';
import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';
import { usePlanDetailsQueryCacheKeys } from './usePlanDetailsQuery.shared';
import type { PlanDetailsQueryResult, UsePlanDetailsQueryParams } from './usePlanDetailsQuery.types';

const HOOK_NAME = 'usePlanDetailsQuery';

/**
 * This is the new implementation of usePlanDetailsQuery using React Query.
 * It is exported only if the package is built with the `CLERK_USE_RQ` environment variable set to `true`.
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
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1_000 * 60,
  });

  return {
    data: query.data,
    error: (query.error ?? null) as PlanDetailsQueryResult['error'],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}
