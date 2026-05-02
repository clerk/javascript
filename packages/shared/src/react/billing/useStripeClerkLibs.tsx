import type { loadStripe } from '@stripe/stripe-js';

import { defineKeepPreviousDataFn } from '../query/keep-previous-data';
import { useClerkQuery } from '../query/useQuery';
import { useClerk } from '../hooks/useClerk';

type LoadStripeFn = typeof loadStripe;

type StripeClerkLibs = {
  loadStripe: LoadStripeFn;
};

export type UseStripeClerkLibsResult = StripeClerkLibs | null;

/**
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
