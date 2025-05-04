import type { ClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { __experimental_CheckoutProps, __experimental_CommerceCheckoutResource } from '@clerk/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useFetch } from './useFetch';

export const useCheckout = (props: __experimental_CheckoutProps) => {
  const { planId, planPeriod, subscriberType = 'user', __experimental_checkoutContinueUrl } = props;
  const { __experimental_commerce, __experimental_buildCheckoutContinueUrl } = useClerk();
  const { organization } = useOrganization();
  const [currentCheckout, setCurrentCheckout] = useState<__experimental_CommerceCheckoutResource | null>(null);

  const checkoutContinueUrl = useMemo(() => {
    if (__experimental_checkoutContinueUrl) {
      return __experimental_checkoutContinueUrl;
    }

    return __experimental_buildCheckoutContinueUrl?.();
  }, [__experimental_checkoutContinueUrl, __experimental_buildCheckoutContinueUrl]);

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

  const error = _error as ClerkAPIResponseError | undefined;

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
    errors: error?.errors,
    checkoutContinueUrl,
  };
};
