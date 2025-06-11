import type { ClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useOrganization, useSession, useUser } from '@clerk/shared/react';
import type {
  ClerkAPIError,
  CommerceCheckoutResource,
  CommercePlanResource,
  ConfirmCheckoutParams,
} from '@clerk/types';
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { useCheckoutContext, usePlans } from '../../contexts';

type CheckoutStatus =
  | 'initializing'
  | 'initialized'
  | 'completed'
  | 'confirming'
  | 'missing_payer_email'
  | 'invalid_plan_change'
  | 'error';

const CheckoutContextRoot = createContext<
  | (UseCheckoutReturnV2 & {
      plan: CommercePlanResource | undefined;
    })
  | null
>(null);

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
  start: () => void;
  error: ClerkAPIResponseError | undefined;
  step: CheckoutStatus;
  clear: () => void;
  finalize: () => void;
};

export const useCheckoutV2 = (options?: {
  onConfirmError?: (error: ClerkAPIResponseError) => void;
}): UseCheckoutReturnV2 => {
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
  } = useSWRMutation<CommerceCheckoutResource, { errors: ClerkAPIError[] }, typeof cacheKey>(
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
      throwOnError: false,
      onError: error => {
        options?.onConfirmError?.(error);
      },
      onSuccess: data => {
        mutate(data, false);
        onSubscriptionComplete?.();
        // We don't expect the session to change between the start and confirm calls
      },
    },
  );

  const finalize = useCallback(() => {
    void clerk.setActive({ session: session?.id });
  }, [clerk, session?.id]);

  const clear = useCallback(() => {
    void mutate(undefined, false);
  }, [mutate]);

  const step = useMemo(() => {
    if (isStarting) return 'initializing';
    if (isConfirming) return 'confirming';
    const completedCode = 'completed';
    if (checkout?.status === completedCode) return completedCode;
    if (checkout) return 'initialized';

    const missingCode = 'missing_payer_email';
    const isMissingPayerEmail = !!error?.errors?.some((e: ClerkAPIError) => e.code === missingCode);
    if (isMissingPayerEmail) return missingCode;
    const invalidChangeCode = 'invalid_plan_change';
    if (error?.errors?.[0]?.code === invalidChangeCode) return invalidChangeCode;
    return 'error';
  }, [isStarting, error, checkout, checkout?.status, confirmError, isConfirming]);

  return {
    checkout,
    start,
    // @ts-expect-error things are typed as optional
    error,
    step,
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
  const { data: checkout, mutate } = useSWR<CommerceCheckoutResource | undefined>(cacheKey);

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
    checkout,
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
  const { planId } = useCheckoutContext();
  const { data: plans } = usePlans();
  const checkout = useCheckoutV2();

  const plan = plans?.find(p => p.id === planId);

  useEffect(() => {
    checkout.start();
    return checkout.clear;
  }, []);

  return (
    <CheckoutContextRoot.Provider
      value={{
        ...checkout,
        plan,
      }}
    >
      {children}
    </CheckoutContextRoot.Provider>
  );
};

const Stage = ({ children, name }: { children: React.ReactNode; name: CheckoutStatus }) => {
  const ctx = useCheckoutContextRoot();
  if (ctx.step !== name) {
    return null;
  }
  return children;
};

export { Root, Stage };
