import { useCallback, useMemo } from 'react';

import type { BillingInitializedPaymentMethodResource, ForPayerType } from '../../types';
import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQueryClient } from '../clerk-rq/use-clerk-query-client';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useOrganizationContext, useUserContext } from '../contexts';
import { useBillingHookEnabled } from '../hooks/useBillingHookEnabled';
import { useClearQueriesOnSignOut } from '../hooks/useClearQueriesOnSignOut';

type InitializePaymentMethodOptions = {
  for?: ForPayerType;
};

export type UseInitializePaymentMethodResult = {
  initializedPaymentMethod: BillingInitializedPaymentMethodResource | undefined;
  initializePaymentMethod: () => Promise<BillingInitializedPaymentMethodResource | undefined>;
};

/**
 * @internal
 */
function useInitializePaymentMethod(options?: InitializePaymentMethodOptions): UseInitializePaymentMethodResult {
  const { for: forType } = options ?? {};
  const { organization } = useOrganizationContext();
  const user = useUserContext();

  const resource = forType === 'organization' ? organization : user;

  const billingEnabled = useBillingHookEnabled(options);

  const stableKey = 'billing-payment-method-initialize';
  const authenticated = true;

  const queryKey = useMemo(() => {
    return [stableKey, authenticated, { resourceId: resource?.id }, {}] as const;
  }, [resource?.id]);

  const isEnabled = Boolean(resource?.id) && billingEnabled;

  useClearQueriesOnSignOut({
    isSignedOut: user === null,
    authenticated,
    stableKeys: stableKey,
  });

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
    placeholderData: defineKeepPreviousDataFn(isEnabled),
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
