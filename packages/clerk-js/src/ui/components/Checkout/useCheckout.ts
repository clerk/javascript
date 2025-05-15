import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { __internal_CheckoutProps } from '@clerk/types';
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
    ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
    planId,
    planPeriod,
  };

  const { data, mutate } = useSWR(cacheKey);

  const { trigger, isMutating, error } = useSWRMutation(
    cacheKey,
    key =>
      clerk.billing?.startCheckout({
        planId: key.planId,
        planPeriod: key.planPeriod,
        ...(key.orgId ? { orgId: key.orgId } : {}),
      }),
    {
      throwOnError: true,
      onSuccess: data => {
        mutate(data, false);
      },
    },
  );

  useEffect(() => {
    void trigger();
  }, []);

  return {
    checkout: data,
    updateCheckout: (checkout: CommerceCheckoutResource) => mutate(checkout, false),
    isLoading: isMutating,
    errors: error?.errors,
  };
};
