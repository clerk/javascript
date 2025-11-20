import { eventMethodCalled } from '../../telemetry/events';
import { useClerkQuery } from '../clerk-rq/useQuery';
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
 * @internal
 */
function KeepPreviousDataFn<Data>(previousData: Data): Data {
  return previousData;
}

/**
 * This is the new implementation of usePaymentAttemptQuery using React Query.
 * It is exported only if the package is built with the `CLERK_USE_RQ` environment variable set to `true`.
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

  const query = useClerkQuery({
    queryKey,
    queryFn: ({ queryKey }) => {
      const args = queryKey[3].args;
      return clerk.billing.getPaymentAttempt(args);
    },
    enabled: queryEnabled,
    placeholderData: keepPreviousData ? KeepPreviousDataFn : undefined,
    staleTime: 1_000 * 60,
  });

  return {
    data: query.data,
    // Our existing types for SWR return undefined when there is no error, but React Query returns null.
    // So we need to convert the error to undefined, for backwards compatibility.
    error: query.error ?? undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}
