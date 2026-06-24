import { useCallback, useEffect, useMemo, useRef } from 'react';

import { eventMethodCalled } from '../../telemetry/events';
import type { BillingCreditLedgerResource, ClerkPaginatedResponse, ForPayerType } from '../../types';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { INTERNAL_STABLE_KEYS } from '../stable-keys';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useUserBase } from './base/useUserBase';
import { useBillingIsEnabled } from './useBillingIsEnabled';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';
import { createCacheKeys } from './createCacheKeys';

const HOOK_NAME = 'useCreditHistory';

export type UseCreditHistoryParams = {
  for?: ForPayerType;
  payerId?: string;
  enabled?: boolean;
};

export type CreditHistoryResult = {
  data: ClerkPaginatedResponse<BillingCreditLedgerResource> | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isFetching: boolean;
  revalidate: () => Promise<void> | void;
};

/**
 * @internal
 */
export function __internal_useCreditHistoryQuery(params?: UseCreditHistoryParams): CreditHistoryResult {
  useAssertWrappedByClerkProvider(HOOK_NAME);

  const clerk = useClerkInstanceContext();
  const user = useUserBase();
  const organization = useOrganizationBase();

  const billingEnabled = useBillingIsEnabled(params);

  const recordedRef = useRef(false);
  useEffect(() => {
    if (!recordedRef.current && clerk?.telemetry) {
      clerk.telemetry.record(eventMethodCalled(HOOK_NAME));
      recordedRef.current = true;
    }
  }, [clerk]);

  const payerId = params?.payerId;

  const [queryClient] = useClerkQueryClient();

  const { queryKey, invalidationKey, stableKey, authenticated } = useMemo(() => {
    const isOrganization = params?.for === 'organization';
    const safeOrgId = isOrganization ? organization?.id : undefined;

    return createCacheKeys({
      stablePrefix: INTERNAL_STABLE_KEYS.CREDIT_HISTORY_KEY,
      authenticated: true,
      tracked: {
        userId: user?.id,
        orgId: safeOrgId,
        payerId,
      },
      untracked: {
        args: { payerId: payerId!, orgId: safeOrgId },
      },
    });
  }, [user?.id, organization?.id, params?.for, payerId]);

  const queriesEnabled = Boolean(user?.id && billingEnabled && payerId && (params?.enabled ?? true));
  useClearQueriesOnSignOut({
    isSignedOut: user === null,
    authenticated,
    stableKeys: stableKey,
  });

  const query = useClerkQuery({
    queryKey,
    queryFn: ({ queryKey }) => {
      const obj = queryKey[3];
      return clerk.billing.getCreditHistory(obj.args);
    },
    staleTime: 1_000 * 60,
    enabled: queriesEnabled,
  });

  const revalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: invalidationKey }),
    [queryClient, invalidationKey],
  );

  return {
    data: query.data,
    error: query.error ?? undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    revalidate,
  };
}
