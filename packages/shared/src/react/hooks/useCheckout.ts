import type { CommerceCheckoutResource, CommerceSubscriptionPlanPeriod, ConfirmCheckoutParams } from '@clerk/types';
import { useCallback, useMemo } from 'react';
import useSWRMutation from 'swr/mutation';

import type { ClerkAPIResponseError } from '../..';
import { useSWR } from '../clerk-swr';
import { useClerk } from './useClerk';
import { useOrganization } from './useOrganization';
import { useSession } from './useSession';
import { useUser } from './useUser';

type CheckoutStatus = 'awaiting_initialization' | 'awaiting_confirmation' | 'completed';

type UseCheckoutReturn = {
  checkout: CommerceCheckoutResource | undefined;
  confirm: (params: ConfirmCheckoutParams) => Promise<CommerceCheckoutResource>;
  start: () => Promise<CommerceCheckoutResource>;
  isStarting: boolean;
  isConfirming: boolean;
  error: ClerkAPIResponseError | undefined;
  status: CheckoutStatus;
  clear: () => void;
  finalize: (params: { redirectUrl?: string }) => void;
  fetchStatus: 'idle' | 'fetching' | 'error';
};

type UseCheckoutOptions = {
  for?: 'organization';
  planPeriod: CommerceSubscriptionPlanPeriod;
  planId: string;
};

export const useCheckout = (options: UseCheckoutOptions): UseCheckoutReturn => {
  const { for: forOrganization, planId, planPeriod } = options;
  const clerk = useClerk();
  const { organization } = useOrganization();
  const { user } = useUser();
  const { session } = useSession();

  const cacheKey = {
    key: `commerce-checkout`,
    userId: user?.id,
    arguments: {
      ...(forOrganization === 'organization' ? { orgId: organization?.id } : {}),
      planId,
      planPeriod,
    },
  };

  // Manually handle the cache
  const { data: checkout, mutate } = useSWR<CommerceCheckoutResource | undefined>(cacheKey);

  // Use `useSWRMutation` to avoid revalidations on stale-data/focus etc.
  const {
    trigger: start,
    isMutating: isStarting,
    error,
  } = useSWRMutation<CommerceCheckoutResource, ClerkAPIResponseError, typeof cacheKey>(
    cacheKey,
    key => clerk.billing?.startCheckout(key.arguments),
    {
      throwOnError: true,
      onSuccess: data => {
        void mutate(data, false);
      },
    },
  );

  const cacheKeyConfirm = {
    key: `commerce-checkout-confirm`,
    userId: user?.id,
    checkoutId: checkout?.id,
  };

  const {
    trigger: confirm,
    isMutating: isConfirming,
    error: confirmError,
  } = useSWRMutation<CommerceCheckoutResource, ClerkAPIResponseError, typeof cacheKeyConfirm, ConfirmCheckoutParams>(
    cacheKeyConfirm,
    // @ts-expect-error things are typed as optional
    (_, { arg }) => checkout?.confirm(arg),
    {
      throwOnError: true,
      onSuccess: data => {
        void mutate(data, false);
      },
    },
  );

  const fetchStatus = useMemo(() => {
    if (isStarting || isConfirming) return 'fetching';
    if (error || confirmError) return 'error';
    return 'idle';
  }, [isStarting, isConfirming, error, confirmError]);

  const finalize = useCallback(
    ({ redirectUrl }: { redirectUrl?: string }) => {
      void clerk.setActive({ session: session?.id, redirectUrl });
    },
    [clerk, session?.id],
  );

  const clear = useCallback(() => {
    void mutate(undefined, false);
  }, [mutate]);

  const status = useMemo(() => {
    const completedCode = 'completed';
    if (checkout?.status === completedCode) return 'completed';
    if (checkout) {
      return 'awaiting_confirmation';
    }
    return 'awaiting_initialization';
  }, [checkout, checkout?.status]);

  return {
    checkout,
    start,
    isStarting,
    isConfirming,
    error: error || confirmError,
    status,
    fetchStatus,
    confirm,
    clear,
    finalize,
  };
};
