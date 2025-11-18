import { billingPlanDetailQueryKeys, useClerk, useClerkQuery } from '@clerk/shared/react';
import type { BillingPlanResource, ClerkAPIResponseError } from '@clerk/shared/types';
import { useMemo } from 'react';

function keepPreviousDataFn<Data>(previousData: Data): Data {
  return previousData;
}

type UsePlanDetailsQueryParams = {
  planId?: string | null;
  initialPlan?: BillingPlanResource | null;
  enabled?: boolean;
  keepPreviousData?: boolean;
};

export const __internal_usePlanDetailsQuery = (params: UsePlanDetailsQueryParams = {}) => {
  const { planId, initialPlan = null, enabled = true, keepPreviousData = true } = params;
  const clerk = useClerk();

  const targetPlanId = planId ?? initialPlan?.id ?? null;

  const { queryKey } = useMemo(() => billingPlanDetailQueryKeys({ planId: targetPlanId }), [targetPlanId]);

  const queryEnabled = Boolean(targetPlanId) && enabled;

  const queryResult = useClerkQuery<BillingPlanResource, ClerkAPIResponseError>({
    queryKey,
    queryFn: () => {
      if (!targetPlanId) {
        throw new Error('planId is required to fetch plan details');
      }
      return clerk.billing.getPlan({ id: targetPlanId });
    },
    enabled: queryEnabled,
    initialData: initialPlan ?? undefined,
    placeholderData: keepPreviousData ? keepPreviousDataFn : undefined,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1_000 * 60,
  });

  return {
    ...queryResult,
    error: queryResult.error ?? undefined,
  };
};
