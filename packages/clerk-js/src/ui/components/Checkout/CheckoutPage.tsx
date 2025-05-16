import { useClerk, useOrganization } from '@clerk/shared/react';
import { useUser } from '@clerk/shared/react/index';
import type { ClerkAPIError, CommerceCheckoutResource, CommercePlanResource } from '@clerk/types';
import { createContext, useContext, useEffect } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { useCheckoutContext, usePlans } from '../../contexts';

const CheckoutContextRoot = createContext<{
  checkout: CommerceCheckoutResource | undefined;
  isLoading: boolean;
  updateCheckout: (checkout: CommerceCheckoutResource) => void;
  errors: ClerkAPIError[];
  startCheckout: () => void;
  plan: CommercePlanResource | undefined;
} | null>(null);

export const useCheckoutContextRoot = () => {
  const ctx = useContext(CheckoutContextRoot);
  if (!ctx) {
    throw new Error('CheckoutContextRoot not found');
  }
  return ctx;
};

const useCheckoutCreator = () => {
  const { planId, planPeriod, subscriberType = 'user' } = useCheckoutContext();
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
    updateCheckout: (checkout: CommerceCheckoutResource) => mutate(checkout, false),
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

  return (
    <CheckoutContextRoot.Provider
      value={{
        checkout,
        isLoading,
        updateCheckout,
        errors,
        startCheckout,
        plan,
      }}
    >
      {children}
    </CheckoutContextRoot.Provider>
  );
};

const PendingCheckout = ({ children }: { children: React.ReactNode }) => {
  const ctx = useCheckoutContextRoot();
  if (ctx.isLoading) {
    return children;
  }
  return null;
};

const SuccessScreen = ({ children }: { children: React.ReactNode }) => {
  const ctx = useCheckoutContextRoot();
  if (ctx.checkout?.status === 'completed' && !ctx.isLoading) {
    return children;
  }
  return null;
};

const ErrorScreen = ({ children }: { children: React.ReactNode }) => {
  const ctx = useCheckoutContextRoot();
  const isMissingPayerEmail = !!ctx.errors?.some((e: ClerkAPIError) => e.code === 'missing_payer_email');
  if (ctx.errors && ctx.errors?.[0]?.code !== 'invalid_plan_change' && !isMissingPayerEmail && !ctx.isLoading) {
    return children;
  }
  return null;
};

const InvalidPlanChange = ({ children }: { children: React.ReactNode }) => {
  const ctx = useCheckoutContextRoot();
  if (ctx.errors?.[0]?.code === 'invalid_plan_change' && ctx.plan && !ctx.isLoading) {
    return children;
  }
  return null;
};

const MissingPayerEmail = ({ children }: { children: React.ReactNode }) => {
  const ctx = useCheckoutContextRoot();

  const isMissingPayerEmail = !!ctx.errors?.some((e: ClerkAPIError) => e.code === 'missing_payer_email');
  if (isMissingPayerEmail && !ctx.isLoading) {
    return children;
  }
  return null;
};

const Valid = ({ children }: { children: React.ReactNode }) => {
  const ctx = useCheckoutContextRoot();
  if (ctx.errors || ctx.checkout?.status === 'completed' || ctx.isLoading) {
    return null;
  }
  return children;
};

export { Root, Valid, PendingCheckout, SuccessScreen, ErrorScreen, InvalidPlanChange, MissingPayerEmail };
