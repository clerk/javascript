import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { ClerkAPIError, CommerceCheckoutResource, CommercePlanResource } from '@clerk/types';
import { createContext, useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { useCheckoutContext, usePlans } from '../../contexts';

type CheckoutStatus = 'pending' | 'ready' | 'completed' | 'missing_payer_email' | 'invalid_plan_change' | 'error';

const CheckoutContextRoot = createContext<{
  checkout: CommerceCheckoutResource | undefined;
  isLoading: boolean;
  updateCheckout: (checkout: CommerceCheckoutResource) => void;
  errors: ClerkAPIError[];
  startCheckout: () => void;
  plan: CommercePlanResource | undefined;
  status: CheckoutStatus;
} | null>(null);

export const useCheckoutContextRoot = () => {
  const ctx = useContext(CheckoutContextRoot);
  if (!ctx) {
    throw new Error('CheckoutContextRoot not found');
  }
  return ctx;
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

const Root = ({ children }: { children: React.ReactNode }) => {
  const { planId } = useCheckoutContext();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { checkout, isMutating, updateCheckout, errors, startCheckout } = useCheckoutCreator();

  const plan = plans?.find(p => p.id === planId);

  const isLoading = isMutating || plansLoading;

  const status = useMemo(() => {
    if (isLoading) return 'pending';
    const completedCode = 'completed';
    if (checkout?.status === completedCode) return completedCode;
    if (checkout) return 'ready';

    const missingCode = 'missing_payer_email';
    const isMissingPayerEmail = !!errors?.some((e: ClerkAPIError) => e.code === missingCode);
    if (isMissingPayerEmail) return missingCode;
    const invalidChangeCode = 'invalid_plan_change';
    if (errors?.[0]?.code === invalidChangeCode && plan) return invalidChangeCode;
    return 'error';
  }, [isLoading, errors, checkout, plan?.id, checkout?.status]);

  return (
    <CheckoutContextRoot.Provider
      value={{
        checkout,
        isLoading,
        updateCheckout,
        errors,
        startCheckout,
        plan,
        status,
      }}
    >
      {children}
    </CheckoutContextRoot.Provider>
  );
};

const Stage = ({ children, name }: { children: React.ReactNode; name: CheckoutStatus }) => {
  const ctx = useCheckoutContextRoot();
  if (ctx.status !== name) {
    return null;
  }
  return children;
};

export { Root, Stage };
