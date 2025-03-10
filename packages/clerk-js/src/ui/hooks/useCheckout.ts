import { useClerk } from '@clerk/shared/react';
import type { __experimental_CheckoutProps, CommerceCheckoutResource } from '@clerk/types';
import { useCallback, useEffect, useState } from 'react';

import { useFetch } from './useFetch';

export const useCheckout = (props: __experimental_CheckoutProps) => {
  const { planId, planPeriod } = props;
  const { __experimental_commerce } = useClerk();
  const [currentCheckout, setCurrentCheckout] = useState<CommerceCheckoutResource | null>(null);

  const { data: initialCheckout, isLoading } = useFetch(__experimental_commerce?.__experimental_billing.startCheckout, {
    planId,
    planPeriod,
  });

  useEffect(() => {
    if (initialCheckout && !currentCheckout) {
      setCurrentCheckout(initialCheckout);
    }
  }, [initialCheckout, currentCheckout]);

  const updateCheckout = useCallback((newCheckout: CommerceCheckoutResource) => {
    setCurrentCheckout(newCheckout);
  }, []);

  return {
    checkout: currentCheckout || initialCheckout,
    updateCheckout,
    isLoading,
  };
};
