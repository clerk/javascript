import { billingPaymentAttemptQueryKeys, useClerk, useClerkQuery, useOrganizationContext } from '@clerk/shared/react';
import type { BillingPaymentResource, ClerkAPIResponseError, ForPayerType } from '@clerk/shared/types';
import { useMemo } from 'react';

function keepPreviousDataFn<Data>(previousData: Data): Data {
  return previousData;
}

type UsePaymentAttemptQueryParams = {
  paymentAttemptId?: string | null;
  for?: ForPayerType;
  enabled?: boolean;
  keepPreviousData?: boolean;
};

const usePaymentAttemptQueryInternal = (params: UsePaymentAttemptQueryParams = {}) => {
  const { paymentAttemptId = null, enabled = true, keepPreviousData = false, for: forType = 'user' } = params;
  const clerk = useClerk();
  const { organization } = useOrganizationContext();

  const organizationId = forType === 'organization' ? (organization?.id ?? null) : null;
  const userId = clerk.user?.id ?? null;

  const { queryKey } = useMemo(
    () =>
      billingPaymentAttemptQueryKeys({
        paymentAttemptId,
        forType,
        userId,
        orgId: organizationId,
      }),
    [paymentAttemptId, forType, userId, organizationId],
  );

  const queryEnabled = Boolean(paymentAttemptId) && enabled && (forType !== 'organization' || Boolean(organizationId));

  const queryResult = useClerkQuery<BillingPaymentResource, ClerkAPIResponseError>({
    queryKey,
    queryFn: () => {
      if (!paymentAttemptId) {
        throw new Error('paymentAttemptId is required to fetch a payment attempt');
      }
      return clerk.billing.getPaymentAttempt({
        id: paymentAttemptId,
        orgId: organizationId ?? undefined,
      });
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

export const __internal_usePaymentAttemptQuery = usePaymentAttemptQueryInternal;
