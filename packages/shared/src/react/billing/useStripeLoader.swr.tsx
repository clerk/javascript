import type { Stripe } from '@stripe/stripe-js';

import { useSWR } from '../clerk-swr';
import type { UseStripeClerkLibsResult } from './useStripeClerkLibs';

type StripeLoaderOptions = {
  stripeClerkLibs: UseStripeClerkLibsResult;
  externalGatewayId?: string;
  stripePublishableKey?: string;
};

export type UseStripeLoaderResult = Stripe | null | undefined;

/**
 * This is the existing implementation of the Stripe instance loader using SWR.
 * It is kept here for backwards compatibility until our next major version.
 *
 * @internal
 */
function useStripeLoader(options: StripeLoaderOptions): UseStripeLoaderResult {
  const { stripeClerkLibs, externalGatewayId, stripePublishableKey } = options;

  const swr = useSWR(
    stripeClerkLibs && externalGatewayId && stripePublishableKey
      ? {
          key: 'stripe-sdk',
          externalGatewayId,
          stripePublishableKey,
        }
      : null,
    ({ stripePublishableKey, externalGatewayId }) => {
      return stripeClerkLibs?.loadStripe(stripePublishableKey, {
        stripeAccount: externalGatewayId,
      });
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      dedupingInterval: 1_000 * 60,
    },
  );

  return swr.data;
}

export { useStripeLoader as __internal_useStripeLoader };
