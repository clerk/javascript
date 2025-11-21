import type { loadStripe } from '@stripe/stripe-js';

import { defineKeepPreviousDataFn } from '../clerk-rq/keep-previous-data';
import { useClerkQuery } from '../clerk-rq/useQuery';
import { useBillingHookEnabled } from '../hooks/useBillingHookEnabled';
import { useClerk } from '../hooks/useClerk';

type LoadStripeFn = typeof loadStripe;

type StripeClerkLibs = {
  loadStripe: LoadStripeFn;
};

/**
 * This is the new implementation of the Stripe libraries loader using React Query.
 * It is exported only if the package is built with the `CLERK_USE_RQ` environment variable set to `true`.
 *
 * @internal
 */
function useStripeClerkLibs(): StripeClerkLibs | null {
  const clerk = useClerk();

  const billingEnabled = useBillingHookEnabled();

  const query = useClerkQuery({
    queryKey: ['clerk-stripe-sdk'],
    queryFn: async () => {
      const loadStripe = (await clerk.__internal_loadStripeJs()) as LoadStripeFn;
      return { loadStripe };
    },
    enabled: billingEnabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    placeholderData: defineKeepPreviousDataFn(true),
  });

  return query.data ?? null;
}

export { useStripeClerkLibs as __internal_useStripeClerkLibs };
