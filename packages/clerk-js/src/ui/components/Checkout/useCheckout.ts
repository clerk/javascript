import type { ClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useOrganization, useSession, useUser } from '@clerk/shared/react';
import type { __internal_CheckoutProps, CommerceCheckoutResource } from '@clerk/types';
import { useCallback, useEffect, useState } from 'react';

import { useCheckoutContext } from '../contexts';
import { useFetch } from '../../hooks/useFetch';

export const useCheckout = (props: __internal_CheckoutProps) => {
  const { planId, planPeriod, subscriberType = 'user' } = props;
  const clerk = useClerk();
  const { organization } = useOrganization();
  const { session } = useSession();
  const [currentCheckout, setCurrentCheckout] = useState<CommerceCheckoutResource | null>(null);
  const { newSubscriptionRedirectUrl } = useCheckoutContext();
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

  const updateCheckout = useCallback(
    (newCheckout: CommerceCheckoutResource) => {
      setCurrentCheckout(newCheckout);
      // if (session?.id) {
      //   void clerk.setActive({ session: session.id });
      // }
    },
    [session?.id, clerk.setActive],
  );

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
  };
};
