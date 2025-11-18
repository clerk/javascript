import { eventMethodCalled } from '../../telemetry/events';
import { useSWR } from '../clerk-swr';
import {
  useAssertWrappedByClerkProvider,
  useClerkInstanceContext,
  useOrganizationContext,
  useUserContext,
} from '../contexts';
import { usePaymentAttemptQueryCacheKeys } from './usePaymentAttemptQuery.shared';
import type { PaymentAttemptQueryResult, UsePaymentAttemptQueryParams } from './usePaymentAttemptQuery.types';

const HOOK_NAME = 'usePaymentAttemptQuery';

/**
 * This is the existing implementation of usePaymentAttemptQuery using SWR.
 * It is kept here for backwards compatibility until our next major version.
 *
 * @internal
 */
export function __internal_usePaymentAttemptQuery(params: UsePaymentAttemptQueryParams): PaymentAttemptQueryResult {
  useAssertWrappedByClerkProvider(HOOK_NAME);

  const { paymentAttemptId, enabled = true, keepPreviousData = false, for: forType = 'user' } = params;
  const clerk = useClerkInstanceContext();
  const user = useUserContext();
  const { organization } = useOrganizationContext();

  clerk.telemetry?.record(eventMethodCalled(HOOK_NAME));

  const organizationId = forType === 'organization' ? (organization?.id ?? null) : null;
  const userId = user?.id ?? null;

  const { queryKey } = usePaymentAttemptQueryCacheKeys({
    paymentAttemptId,
    userId,
    orgId: organizationId,
    for: forType,
  });

  const queryEnabled = Boolean(paymentAttemptId) && enabled && (forType !== 'organization' || Boolean(organizationId));

  const swr = useSWR(
    queryEnabled ? { queryKey } : null,
    ({ queryKey }) => {
      const args = queryKey[3].args;
      return clerk.billing.getPaymentAttempt(args);
    },
    {
      dedupingInterval: 1_000 * 60,
      keepPreviousData,
    },
  );

  return {
    data: swr.data,
    error: swr.error,
    isLoading: swr.isLoading,
    isFetching: swr.isValidating,
  };
}
