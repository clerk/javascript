import { useClerk, useOrganization } from '@clerk/shared/react';
import type { __experimental_CheckoutProps, __experimental_CommerceCheckoutResource } from '@clerk/types';
import { useCallback, useEffect, useState } from 'react';

import { useFetch } from './useFetch';

export const useCheckout = (props: __experimental_CheckoutProps) => {
  const { planId, planPeriod, subscriberType = 'user' } = props;
  const { __experimental_commerce } = useClerk();
  const { organization } = useOrganization();
  const [currentCheckout, setCurrentCheckout] = useState<__experimental_CommerceCheckoutResource | null>(null);

  const { data: initialCheckout, isLoading } = useFetch(__experimental_commerce?.__experimental_billing.startCheckout, {
    planId,
    planPeriod,
    ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
  });

  useEffect(() => {
    if (initialCheckout && !currentCheckout) {
      setCurrentCheckout(initialCheckout);
    }
  }, [initialCheckout, currentCheckout]);

  const updateCheckout = useCallback((newCheckout: __experimental_CommerceCheckoutResource) => {
    setCurrentCheckout(newCheckout);
  }, []);

  return {
    checkout: currentCheckout || initialCheckout,
    updateCheckout,
    isLoading,
  };
};
