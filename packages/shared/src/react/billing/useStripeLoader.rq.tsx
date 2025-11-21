import type { Stripe } from '@stripe/stripe-js';
import { useMemo } from 'react';

import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import type { UseStripeClerkLibsResult } from './useStripeClerkLibs';

type StripeLoaderOptions = {
  stripeClerkLibs: UseStripeClerkLibsResult;
  externalGatewayId?: string;
  stripePublishableKey?: string;
};

export type UseStripeLoaderResult = Stripe | null | undefined;

/**
 * This is the new implementation of the Stripe instance loader using React Query.
 * It is exported only if the package is built with the `CLERK_USE_RQ` environment variable set to `true`.
 *
 * @internal
 */
function useStripeLoader(options: StripeLoaderOptions): UseStripeLoaderResult {
  const { stripeClerkLibs, externalGatewayId, stripePublishableKey } = options;

  const queryKey = useMemo(() => {
    return ['stripe-sdk', { externalGatewayId, stripePublishableKey }] as const;
  }, [externalGatewayId, stripePublishableKey]);

  const isEnabled = Boolean(stripeClerkLibs && externalGatewayId && stripePublishableKey);

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
