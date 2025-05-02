import type { ClerkAPIResponseError } from '@clerk/shared';
import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { __experimental_CheckoutProps, __experimental_CommerceCheckoutResource } from '@clerk/types';
import { useCallback, useEffect, useState } from 'react';

import { useFetch } from './useFetch';

export const useCheckout = (props: __experimental_CheckoutProps) => {
  const { planId, planPeriod, subscriberType = 'user' } = props;
  const { __experimental_commerce } = useClerk();
  const { organization } = useOrganization();
  const [currentCheckout, setCurrentCheckout] = useState<__experimental_CommerceCheckoutResource | null>(null);

  const { user } = useUser();
  const {
    data: initialCheckout,
    isLoading,
    invalidate,
    revalidate,
    error: _error,
  } = useFetch(
    __experimental_commerce?.__experimental_billing.startCheckout,
    {
      planId,
      planPeriod,
      ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
    },
    undefined,
    `commerce-checkout-${user?.id}`,
  );

  const error = _error as ClerkAPIResponseError;

  const updateCheckout = useCallback((newCheckout: __experimental_CommerceCheckoutResource) => {
    setCurrentCheckout(newCheckout);
  }, []);

  useEffect(() => {
    if (initialCheckout && !currentCheckout) {
      setCurrentCheckout(initialCheckout);
    }
  }, [initialCheckout, currentCheckout]);

  return {
    checkout: currentCheckout || initialCheckout,
    updateCheckout,
    isLoading,
    invalidate,
    revalidate,
    errors: error.errors,
  };
};
