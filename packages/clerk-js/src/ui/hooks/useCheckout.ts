import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { __internal_CheckoutProps, ClerkAPIError, CommerceCheckoutResource } from '@clerk/types';
import { useCallback, useEffect, useState } from 'react';

import { useFetch } from './useFetch';

export const useCheckout = (props: __internal_CheckoutProps) => {
  const { planId, planPeriod, subscriberType = 'user' } = props;
  const { commerce } = useClerk();
  const { organization } = useOrganization();
  const [currentCheckout, setCurrentCheckout] = useState<CommerceCheckoutResource | null>(null);

  const { user } = useUser();
  const {
    data: initialCheckout,
    isLoading,
    invalidate,
    revalidate,
    error,
  } = useFetch(
    commerce?.billing.startCheckout,
    {
      planId,
      planPeriod,
      ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
    },
    undefined,
    `commerce-checkout-${user?.id}`,
  );

  const updateCheckout = useCallback((newCheckout: CommerceCheckoutResource) => {
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
    isMissingPayerEmail: error?.errors.some((e: ClerkAPIError) => e.code === 'missing_payer_email'),
  };
};
