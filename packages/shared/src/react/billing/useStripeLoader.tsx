import type { Stripe } from '@stripe/stripe-js';
import { useMemo } from 'react';

import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useBillingIsEnabled } from '../hooks/useBillingIsEnabled';
import type { UseStripeClerkLibsResult } from './useStripeClerkLibs';

type StripeLoaderOptions = {
  stripeClerkLibs: UseStripeClerkLibsResult;
  externalGatewayId?: string;
  stripePublishableKey?: string;
};

export type UseStripeLoaderResult = Stripe | null | undefined;

/**
 * @internal
 */
function useStripeLoader(options: StripeLoaderOptions): UseStripeLoaderResult {
  const { stripeClerkLibs, externalGatewayId, stripePublishableKey } = options;

  const queryKey = useMemo(() => {
    return ['stripe-sdk', { externalGatewayId, stripePublishableKey }] as const;
  }, [externalGatewayId, stripePublishableKey]);

  const billingEnabled = useBillingIsEnabled({ authenticated: true });

  const isEnabled = Boolean(stripeClerkLibs && externalGatewayId && stripePublishableKey) && billingEnabled;

  const query = useClerkQuery({
    queryKey,
    queryFn: () => {
      if (!stripeClerkLibs || !externalGatewayId || !stripePublishableKey) {
        return null;
      }

      return stripeClerkLibs.loadStripe(stripePublishableKey, {
        stripeAccount: externalGatewayId,
      });
    },
    enabled: isEnabled,
    staleTime: 1_000 * 60,
    refetchOnWindowFocus: false,
    placeholderData: defineKeepPreviousDataFn(true),
  });

  return query.data;
}

export { useStripeLoader as __internal_useStripeLoader };
