import { useClerk } from '@clerk/shared/react';
import type { __experimental_CheckoutProps } from '@clerk/types';

import { useFetch } from './useFetch';

export const useCheckout = (props: __experimental_CheckoutProps) => {
  const { planId, planPeriod } = props;
  const { __experimental_commerce } = useClerk();

  const { data: checkout, isLoading } = useFetch(__experimental_commerce?.__experimental_billing.startCheckout, {
    planId,
    planPeriod,
  });

  return {
    checkout,
    isLoading,
  };
};
