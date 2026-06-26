import { useCallback, useEffect, useMemo, useRef } from 'react';

import { eventMethodCalled } from '../../telemetry/events';
import type { BillingCreditBalanceResource, ForPayerType } from '../../types';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';
import { defineKeepPreviousDataFn } from '../query/keep-previous-data';
import { useClerkQueryClient } from '../query/use-clerk-query-client';
import { useClerkQuery } from '../query/useQuery';
import { STABLE_KEYS } from '../stable-keys';
import { useOrganizationBase } from './base/useOrganizationBase';
import { useUserBase } from './base/useUserBase';
import { createCacheKeys } from './createCacheKeys';
import { useBillingIsEnabled } from './useBillingIsEnabled';
import { useClearQueriesOnSignOut } from './useClearQueriesOnSignOut';

const HOOK_NAME = 'useCreditBalance';

export type UseCreditBalanceParams = {
  for?: ForPayerType;
  keepPreviousData?: boolean;
  enabled?: boolean;
};

export type CreditBalanceResult = {
  data: BillingCreditBalanceResource | undefined | null;
  error: Error | undefined;
  isLoading: boolean;
  isFetching: boolean;
  revalidate: () => Promise<void> | void;
};

/**
 * @internal
 */
export function useCreditBalance(params?: UseCreditBalanceParams): CreditBalanceResult {
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

  const keepPreviousData = params?.keepPreviousData ?? false;

  const [queryClient] = useClerkQueryClient();

  const { queryKey, invalidationKey, stableKey, authenticated } = useMemo(() => {
    const isOrganization = params?.for === 'organization';
    const safeOrgId = isOrganization ? organization?.id : undefined;

    return createCacheKeys({
      stablePrefix: STABLE_KEYS.CREDIT_BALANCE_KEY,
      authenticated: true,
      tracked: {
        userId: user?.id,
        orgId: safeOrgId,
      },
      untracked: {
        args: { orgId: safeOrgId },
      },
    });
  }, [user?.id, organization?.id, params?.for]);

  const queriesEnabled = Boolean(user?.id && billingEnabled);
  useClearQueriesOnSignOut({
    isSignedOut: user === null,
    authenticated,
    stableKeys: stableKey,
  });

  const query = useClerkQuery({
    queryKey,
    queryFn: ({ queryKey }) => {
      const obj = queryKey[3];
      return clerk.billing.getCreditBalance(obj.args);
    },
    staleTime: 1_000 * 60,
    enabled: queriesEnabled,
    placeholderData: defineKeepPreviousDataFn(keepPreviousData && queriesEnabled),
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
