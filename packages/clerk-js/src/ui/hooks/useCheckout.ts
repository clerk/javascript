import { useClerk } from '@clerk/shared/react';
import type { __experimental_CheckoutProps, CommerceCheckoutResource } from '@clerk/types';
import { useEffect, useState } from 'react';

import { useFetch } from './useFetch';

export const useCheckout = (props: __experimental_CheckoutProps) => {
  const { planId, planPeriod } = props;
  const { __experimental_commerce } = useClerk();
  const [checkout, setCheckout] = useState<CommerceCheckoutResource>();

  const { data, isLoading } = useFetch(__experimental_commerce?.__experimental_billing.startCheckout, {
    planId,
    planPeriod,
  });

  useEffect(() => {
    if (data) {
      setCheckout(data);
    }
  }, [data]);

  return {
    checkout,
    isLoading,
    setCheckout,
  };
};
