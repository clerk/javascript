import { eventMethodCalled } from '../../telemetry/events';
import { useSWR } from '../clerk-swr';
import { useClerkInstanceContext, useOrganizationContext, useUserContext } from '../contexts';

type UseSubscriptionParams = {
  for?: 'organization' | 'user';
  /**
   * If `true`, the previous data will be kept in the cache until new data is fetched.
   *
   * @default false
   */
  keepPreviousData?: boolean;
};

/**
 * @internal
 */
export const useSubscription = (params?: UseSubscriptionParams) => {
  const clerk = useClerkInstanceContext();
  const user = useUserContext();
  const { organization } = useOrganizationContext();
  clerk.telemetry?.record(eventMethodCalled('useSubscription'));

  return useSWR(
    user?.id
      ? {
          type: 'commerce-subscription',
          userId: user?.id,
          args: { orgId: params?.for === 'organization' ? organization?.id : undefined },
        }
      : null,
    ({ args }) => clerk.billing.getSubscription(args),
    {
      dedupingInterval: 1_000 * 60 * 2, // 2 minutes,
      keepPreviousData: params?.keepPreviousData ?? true,
    },
  );
};
