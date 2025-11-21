import type { loadStripe } from '@stripe/stripe-js';

import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useClerk } from '../hooks/useClerk';

type LoadStripeFn = typeof loadStripe;

type StripeClerkLibs = {
  loadStripe: LoadStripeFn;
};

export type UseStripeClerkLibsResult = StripeClerkLibs | null;

/**
 * This is the new implementation of the Stripe libraries loader using React Query.
 * It is exported only if the package is built with the `CLERK_USE_RQ` environment variable set to `true`.
 *
 * @internal
 */
function useStripeClerkLibs(): UseStripeClerkLibsResult {
  const clerk = useClerk();

  const query = useClerkQuery({
    queryKey: ['clerk-stripe-sdk'],
    queryFn: async () => {
      const loadStripe = (await clerk.__internal_loadStripeJs()) as LoadStripeFn;
      return { loadStripe };
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    placeholderData: defineKeepPreviousDataFn(true),
  });

  return query.data ?? null;
}

export { useStripeClerkLibs as __internal_useStripeClerkLibs };
