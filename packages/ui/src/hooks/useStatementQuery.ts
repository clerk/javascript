import { billingStatementQueryKeys, useClerk, useClerkQuery, useOrganizationContext } from '@clerk/shared/react';
import type { BillingStatementResource, ClerkAPIResponseError, ForPayerType } from '@clerk/shared/types';
import { useMemo } from 'react';

function keepPreviousDataFn<Data>(previousData: Data): Data {
  return previousData;
}

type UseStatementQueryParams = {
  statementId?: string | null;
  for?: ForPayerType;
  enabled?: boolean;
  keepPreviousData?: boolean;
};

const useStatementQueryInternal = (params: UseStatementQueryParams = {}) => {
  const { statementId = null, enabled = true, keepPreviousData = false, for: forType = 'user' } = params;
  const clerk = useClerk();
  const { organization } = useOrganizationContext();

  const organizationId = forType === 'organization' ? (organization?.id ?? null) : null;
  const userId = clerk.user?.id ?? null;

  const { queryKey } = useMemo(
    () =>
      billingStatementQueryKeys({
        statementId,
        forType,
        userId,
        orgId: organizationId,
      }),
    [statementId, forType, userId, organizationId],
  );

  const queryEnabled = Boolean(statementId) && enabled && (forType !== 'organization' || Boolean(organizationId));

  const queryResult = useClerkQuery<BillingStatementResource, ClerkAPIResponseError>({
    queryKey,
    queryFn: () => {
      if (!statementId) {
        throw new Error('statementId is required to fetch a statement');
      }
      return clerk.billing.getStatement({ id: statementId, orgId: organizationId ?? undefined });
    },
    enabled: queryEnabled,
    placeholderData: keepPreviousData ? keepPreviousDataFn : undefined,
    staleTime: 1_000 * 60,
  });

  return {
    ...queryResult,
    error: queryResult.error ?? undefined,
  };
};

export const __internal_useStatementQuery = useStatementQueryInternal;
