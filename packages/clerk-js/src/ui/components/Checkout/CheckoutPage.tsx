import type { ClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useOrganization, useSession, useUser } from '@clerk/shared/react';
import type { CommerceCheckoutResource, ConfirmCheckoutParams } from '@clerk/types';
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { useCheckoutContext } from '../../contexts';

type CheckoutStatusV2 = 'awaiting_initialization' | 'awaiting_confirmation' | 'completed';

const CheckoutContextRoot = createContext<UseCheckoutReturnV2 | null>(null);

export const useCheckoutContextRoot = () => {
  const ctx = useContext(CheckoutContextRoot);
  if (!ctx) {
    throw new Error('CheckoutContextRoot not found');
  }
  return ctx;
};

type UseCheckoutReturnV2 = {
  checkout: CommerceCheckoutResource | undefined;
  confirm: (params: ConfirmCheckoutParams) => Promise<CommerceCheckoutResource>;
  start: () => Promise<CommerceCheckoutResource>;
  isStarting: boolean;
  isConfirming: boolean;
  error: ClerkAPIResponseError | undefined;
  status: CheckoutStatusV2;
  clear: () => void;
  finalize: () => void;
  fetchStatus: 'idle' | 'fetching' | 'error';
};

export const useCheckoutV2 = (options?: { onError?: (error: ClerkAPIResponseError) => void }): UseCheckoutReturnV2 => {
  const { planId, planPeriod, subscriberType = 'user', onSubscriptionComplete } = useCheckoutContext();
  const clerk = useClerk();
  const { organization } = useOrganization();
  const { user } = useUser();
  const { session } = useSession();

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
  const { data: checkout, mutate } = useSWR<CommerceCheckoutResource | undefined>(cacheKey);

  // Use `useSWRMutation` to avoid revalidations on stale-data/focus etc.
  const {
    trigger: start,
    isMutating: isStarting,
    error,
  } = useSWRMutation<CommerceCheckoutResource, ClerkAPIResponseError, typeof cacheKey>(
    cacheKey,
    key =>
      clerk.billing?.startCheckout(
        // @ts-expect-error things are typed as optional
        key.arguments,
      ),
    {
      // Never throw on error, we want to handle it during rendering
      throwOnError: true,
      onError: error => {
        options?.onError?.(error);
      },
      onSuccess: data => {
        mutate(data, false);
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
      // Never throw on error, we want to handle it during rendering
      throwOnError: true,
      onError: error => {
        options?.onError?.(error);
      },
      onSuccess: data => {
        mutate(data, false);
        onSubscriptionComplete?.();
        // We don't expect the session to change between the start and confirm calls
      },
    },
  );

  const fetchStatus = useMemo(() => {
    if (isStarting || isConfirming) return 'fetching';
    if (error || confirmError) return 'error';
    return 'idle';
  }, [isStarting, isConfirming, error, confirmError]);

  const finalize = useCallback(() => {
    void clerk.setActive({ session: session?.id });
  }, [clerk, session?.id]);

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

const useCheckoutCreator = () => {
  const { planId, planPeriod, subscriberType = 'user', onSubscriptionComplete } = useCheckoutContext();
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
  const { data, mutate } = useSWR<CommerceCheckoutResource | undefined>(cacheKey);

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
    updateCheckout: (checkout: CommerceCheckoutResource) => {
      void mutate(checkout, false);
      onSubscriptionComplete?.();
    },
    isMutating,
    errors: error?.errors,
  };
};

console.log('useCheckoutCreator', useCheckoutCreator);

const Root = ({ children }: { children: React.ReactNode }) => {
  const checkout = useCheckoutV2();

  useEffect(() => {
    checkout.start().catch(() => null);
    return checkout.clear;
  }, []);

  return <CheckoutContextRoot.Provider value={checkout}>{children}</CheckoutContextRoot.Provider>;
};

const Stage = ({ children, name }: { children: React.ReactNode; name: CheckoutStatusV2 }) => {
  const ctx = useCheckoutContextRoot();
  if (ctx.status !== name) {
    return null;
  }
  return children;
};

const FetchStatus = ({
  children,
  status,
}: {
  children: React.ReactNode;
  status: 'idle' | 'fetching' | 'error' | 'invalid_plan_change' | 'missing_payer_email';
}) => {
  const { fetchStatus, error } = useCheckoutContextRoot();

  const internalFetchStatus = useMemo(() => {
    if (fetchStatus === 'error' && error?.errors) {
      const errorCodes = error.errors.map(e => e.code);

      if (errorCodes.includes('missing_payer_email')) {
        return 'missing_payer_email';
      }

      if (errorCodes.includes('invalid_plan_change')) {
        return 'invalid_plan_change';
      }
    }

    return fetchStatus;
  }, [fetchStatus, error]);

  if (internalFetchStatus !== status) {
    return null;
  }
  return children;
};

export { Root, Stage, FetchStatus };
