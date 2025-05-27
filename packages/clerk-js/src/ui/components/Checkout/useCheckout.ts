import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { __internal_CheckoutProps, CommerceCheckoutResource } from '@clerk/types';
import { useEffect } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

export const useCheckout = (props: __internal_CheckoutProps) => {
  const { planId, planPeriod, subscriberType = 'user' } = props;
  const clerk = useClerk();
  const { organization } = useOrganization();

  const { user } = useUser();

  const cacheKey = {
    key: `commerce-checkout`,
    userId: user?.id,
    arguments: {
      ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
      planId,
      planPeriod,
    },
  };

  // Manually handle the cache
  const { data, mutate } = useSWR(cacheKey);

  // Use `useSWRMutation` to avoid revalidations on stale-data/focus etc.
  const {
    trigger: startCheckout,
    isMutating,
    error,
  } = useSWRMutation(
    cacheKey,
    key =>
      clerk.billing?.startCheckout(
        // @ts-expect-error things are typed as optional
        key.arguments,
      ),
    {
      // Never throw on error, we want to handle it during rendering
      throwOnError: false,
      onSuccess: data => {
        mutate(data, false);
      },
    },
  );

  useEffect(() => {
    void startCheckout();
    return () => {
      // Clear the cache on unmount
      mutate(undefined, false);
    };
  }, []);

  return {
    checkout: data,
    startCheckout,
    updateCheckout: (checkout: CommerceCheckoutResource) => mutate(checkout, false),
    isLoading: isMutating,
    errors: error?.errors,
  };
};
