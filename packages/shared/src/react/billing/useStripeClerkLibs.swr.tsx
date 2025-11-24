import type { loadStripe } from '@stripe/stripe-js';

import { useSWR } from '../clerk-swr';
import { useClerk } from '../hooks/useClerk';

type LoadStripeFn = typeof loadStripe;

type StripeClerkLibs = {
  loadStripe: LoadStripeFn;
};

export type UseStripeClerkLibsResult = StripeClerkLibs | null;

/**
 * This is the existing implementation of the Stripe libraries loader using SWR.
 * It is kept here for backwards compatibility until our next major version.
 *
 * @internal
 */
function useStripeClerkLibs(): UseStripeClerkLibsResult {
  const clerk = useClerk();

  const swr = useSWR(
    'clerk-stripe-sdk',
    async () => {
      const loadStripe = (await clerk.__internal_loadStripeJs()) as LoadStripeFn;
      return { loadStripe };
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      dedupingInterval: Infinity,
    },
  );

  return swr.data ?? null;
}

export { useStripeClerkLibs as __internal_useStripeClerkLibs };
