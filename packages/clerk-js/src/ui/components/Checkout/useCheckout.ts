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
    undefined,
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
