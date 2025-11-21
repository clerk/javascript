import { useCallback, useMemo } from 'react';

import type { BillingInitializedPaymentMethodResource, ForPayerType } from '../../types';
import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQueryClient } from '../clerk-rq/use-clerk-query-client';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useOrganizationContext, useUserContext } from '../contexts';

type InitializePaymentMethodOptions = {
  for?: ForPayerType;
};

export type UseInitializePaymentMethodResult = {
  initializedPaymentMethod: BillingInitializedPaymentMethodResource | undefined;
  initializePaymentMethod: () => Promise<BillingInitializedPaymentMethodResource | undefined>;
};

/**
 * This is the new implementation of the payment method initializer using React Query.
 * It is exported only if the package is built with the `CLERK_USE_RQ` environment variable set to `true`.
 *
 * @internal
 */
function useInitializePaymentMethod(options?: InitializePaymentMethodOptions): UseInitializePaymentMethodResult {
  const { for: forType = 'user' } = options ?? {};
  const { organization } = useOrganizationContext();
  const user = useUserContext();

  const resource = forType === 'organization' ? organization : user;

  const queryKey = useMemo(() => {
    return ['billing-payment-method-initialize', { resourceId: resource?.id, for: forType }] as const;
  }, [resource?.id, forType]);

  const isEnabled = Boolean(resource?.id);

  const query = useClerkQuery({
    queryKey,
    queryFn: async () => {
      if (!resource) {
        return undefined;
      }

      return resource.initializePaymentMethod({
        gateway: 'stripe',
      });
    },
    enabled: isEnabled,
    staleTime: 1_000 * 60,
    refetchOnWindowFocus: false,
    placeholderData: defineKeepPreviousDataFn(true),
  });

  const [queryClient] = useClerkQueryClient();

  const initializePaymentMethod = useCallback(async () => {
    if (!resource) {
      return undefined;
    }

    const result = await resource.initializePaymentMethod({
      gateway: 'stripe',
    });

    queryClient.setQueryData(queryKey, result);

    return result;
  }, [queryClient, queryKey, resource]);

  return {
    initializedPaymentMethod: query.data ?? undefined,
    initializePaymentMethod,
  };
}

export { useInitializePaymentMethod as __internal_useInitializePaymentMethod };
