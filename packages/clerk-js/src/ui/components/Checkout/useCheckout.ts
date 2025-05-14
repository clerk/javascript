import type { ClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { __internal_CheckoutProps, CommerceCheckoutResource } from '@clerk/types';
import { useEffect, useState } from 'react';

import { useFetch } from '../../hooks/useFetch';

export const useCheckout = (props: __internal_CheckoutProps) => {
  const { planId, planPeriod, subscriberType = 'user' } = props;
  const clerk = useClerk();
  const { organization } = useOrganization();
  const [currentCheckout, setCurrentCheckout] = useState<CommerceCheckoutResource | null>(null);
  const { user } = useUser();
  const {
    data: initialCheckout,
    isLoading,
    invalidate,
    revalidate,
    error: _error,
  } = useFetch(
    clerk.billing?.startCheckout,
    {
      planId,
      planPeriod,
      ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
    },
    {
      // TODO: remove this once we move to useSWR
      // Some more context:
      // The checkout is already invalidated on complete, but the way `useFetch` is implemented
      // there is no way to invalidate the cache by resourceId only (e.g. commerce-checkout-user_xxx),
      // we can only invalidate the cache by resourceId + params as this is how the cache key is constructed.
      // With SWR, we will be able to invalidate the cache by the `commerce-checkout-user_xxx` key,
      // so only invalidation on checkout completion will be needed.
      staleTime: 0,
    },
    `commerce-checkout-${user?.id}`,
  );

  const error = _error as ClerkAPIResponseError | undefined;

  useEffect(() => {
    if (initialCheckout && !currentCheckout) {
      setCurrentCheckout(initialCheckout);
    }
  }, [initialCheckout, currentCheckout]);

  return {
    checkout: currentCheckout || initialCheckout,
    updateCheckout: setCurrentCheckout,
    isLoading,
    invalidate,
    revalidate,
    errors: error?.errors,
  };
};
