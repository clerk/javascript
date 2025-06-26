/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { CommerceCheckoutResource, EnvironmentResource } from '@clerk/types';
import type { Stripe, StripeElements } from '@stripe/stripe-js';
import { type PropsWithChildren, ReactNode, useCallback, useEffect, useState } from 'react';
import React from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { createContextAndHook } from './hooks/createContextAndHook';
import { useClerk } from './hooks/useClerk';
import { useOrganization } from './hooks/useOrganization';
import { useUser } from './hooks/useUser';
import { Elements, PaymentElement, useElements, useStripe } from './stripe-react';

const [StripeLibsContext, useStripeLibsContext] = createContextAndHook<{
  loadStripe: typeof import('@stripe/stripe-js').loadStripe;
} | null>('StripeLibsContext');

const StripeLibsProvider = ({ children }: PropsWithChildren) => {
  const clerk = useClerk();
  const { isLoaded } = useUser();
  const { data: stripeClerkLibs } = useSWR(
    isLoaded ? 'clerk-stripe-sdk' : null,
    async () => {
      const [loadStripe] = await Promise.all([clerk.__internal_loadStripeJs()]);
      return { loadStripe };
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      dedupingInterval: Infinity,
    },
  );

  return (
    <StripeLibsContext.Provider
      value={{
        value: stripeClerkLibs || null,
      }}
    >
      {children}
    </StripeLibsContext.Provider>
  );
};

const useInternalEnvironment = () => {
  const clerk = useClerk();
  // @ts-expect-error `__unstable__environment` is not typed
  return clerk.__unstable__environment as unknown as EnvironmentResource | null | undefined;
};

const usePaymentSourceUtils = (forResource: 'org' | 'user') => {
  const { organization } = useOrganization();
  const { user } = useUser();
  // const subscriberType = useSubscriberTypeContext();
  const resource = forResource === 'org' ? organization : user;
  const stripeClerkLibs = useStripeLibsContext();

  const { data: initializedPaymentSource, trigger: initializePaymentSource } = useSWRMutation(
    {
      key: 'commerce-payment-source-initialize',
      resourceId: resource?.id,
    },
    () =>
      resource?.initializePaymentSource({
        gateway: 'stripe',
      }),
  );
  const environment = useInternalEnvironment();

  useEffect(() => {
    // TODO(@COMMERCE): Handle errors
    void initializePaymentSource();
  }, []);

  const externalGatewayId = initializedPaymentSource?.externalGatewayId;
  const externalClientSecret = initializedPaymentSource?.externalClientSecret;
  const paymentMethodOrder = initializedPaymentSource?.paymentMethodOrder;
  const stripePublishableKey = environment?.commerceSettings.billing.stripePublishableKey;

  const { data: stripe } = useSWR(
    stripeClerkLibs && externalGatewayId && stripePublishableKey
      ? { key: 'stripe-sdk', externalGatewayId, stripePublishableKey }
      : null,
    ({ stripePublishableKey, externalGatewayId }) => {
      // TODO(@COMMERCE): We need to figure out how to handle this
      //   if (__BUILD_DISABLE_RHC__) {
      //     clerkUnsupportedEnvironmentWarning('Stripe');
      //     return;
      //   }
      return stripeClerkLibs?.loadStripe(stripePublishableKey, {
        stripeAccount: externalGatewayId,
      });
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      dedupingInterval: 1_000 * 60, // 1 minute
    },
  );

  return {
    stripe,
    initializePaymentSource,
    externalClientSecret,
    paymentMethodOrder,
  };
};

type internalStripeAppearance = {
  colorPrimary: string;
  colorBackground: string;
  colorText: string;
  colorTextSecondary: string;
  colorSuccess: string;
  colorDanger: string;
  colorWarning: string;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightBold: string;
  fontSizeXl: string;
  fontSizeLg: string;
  fontSizeSm: string;
  fontSizeXs: string;
  borderRadius: string;
  spacingUnit: string;
};

const [PaymentElementContext, usePaymentElementContext] = createContextAndHook<
  ReturnType<typeof usePaymentSourceUtils> & {
    setIsPaymentElementReady: (isPaymentElementReady: boolean) => void;
    isPaymentElementReady: boolean;
    checkout?: CommerceCheckoutResource;
    // TODO(@COMMERCE): What can we do to remove this ?
    paymentDescription: string;
  }
>('PaymentElementContext');

const [StipeUtilsContext, useStipeUtilsContext] = createContextAndHook<{
  stripe: Stripe | undefined | null;
  elements: StripeElements | undefined | null;
}>('StipeUtilsContext');

const ValidateStripeUtils = ({ children }: PropsWithChildren) => {
  const stripe = useStripe();
  const elements = useElements();

  return <StipeUtilsContext.Provider value={{ value: { stripe, elements } }}>{children}</StipeUtilsContext.Provider>;
};

const DummyStripeUtils = ({ children }: PropsWithChildren) => {
  return (
    <StipeUtilsContext.Provider value={{ value: { stripe: undefined, elements: undefined } }}>
      {children}
    </StipeUtilsContext.Provider>
  );
};

const PaymentElementRoot = (
  props: PropsWithChildren<{
    checkout?: CommerceCheckoutResource;
    // TODO(@COMMERCE): What can we do to remove this ?
    stripeAppearance?: internalStripeAppearance;
    // TODO(@COMMERCE): What can we do to remove this ?
    for: 'org' | 'user';
    // TODO(@COMMERCE): What can we do to remove this ?
    paymentDescription: string;
  }>,
) => {
  return (
    <StripeLibsProvider>
      <PaymentElementInternalRoot {...props} />
    </StripeLibsProvider>
  );
};

const PaymentElementInternalRoot = (
  props: PropsWithChildren<{
    checkout?: CommerceCheckoutResource;
    // TODO(@COMMERCE): What can we do to remove this ?
    stripeAppearance?: internalStripeAppearance;
    // TODO(@COMMERCE): What can we do to remove this ?
    for: 'org' | 'user';
    // TODO(@COMMERCE): What can we do to remove this ?
    paymentDescription: string;
  }>,
) => {
  const utils = usePaymentSourceUtils(props.for);
  const { stripe, externalClientSecret } = utils;
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);

  if (stripe && externalClientSecret) {
    return (
      <PaymentElementContext.Provider
        value={{
          value: {
            ...utils,
            setIsPaymentElementReady,
            isPaymentElementReady,
            checkout: props.checkout,
            paymentDescription: props.paymentDescription,
          },
        }}
      >
        <Elements
          // This key is used to reset the payment intent, since Stripe doesn't not provide a way to reset the payment intent.
          key={externalClientSecret}
          stripe={stripe}
          options={{
            loader: 'never',
            clientSecret: externalClientSecret,
            appearance: {
              variables: { ...props.stripeAppearance },
            },
          }}
        >
          <ValidateStripeUtils>{props.children}</ValidateStripeUtils>
        </Elements>
      </PaymentElementContext.Provider>
    );
  }

  return (
    <PaymentElementContext.Provider
      value={{
        value: {
          ...utils,
          setIsPaymentElementReady,
          isPaymentElementReady,
          checkout: props.checkout,
          paymentDescription: props.paymentDescription,
        },
      }}
    >
      <DummyStripeUtils>{props.children}</DummyStripeUtils>
    </PaymentElementContext.Provider>
  );
};

const PaymentElementForm = ({ fallback }: { fallback?: ReactNode }) => {
  const { setIsPaymentElementReady, paymentMethodOrder, checkout, stripe, externalClientSecret, paymentDescription } =
    usePaymentElementContext();
  const environment = useInternalEnvironment();

  if (!stripe || !externalClientSecret) {
    return <>{fallback}</>;
  }

  return (
    <PaymentElement
      fallback={fallback}
      onReady={() => setIsPaymentElementReady(true)}
      options={{
        layout: {
          type: 'tabs',
          defaultCollapsed: false,
        },
        paymentMethodOrder,
        applePay: checkout
          ? {
              recurringPaymentRequest: {
                paymentDescription,
                managementURL: environment?.displayConfig.homeUrl || '', // TODO(@COMMERCE): is this the right URL?
                regularBilling: {
                  amount: checkout.totals.totalDueNow?.amount || checkout.totals.grandTotal.amount,
                  label: checkout.plan.name,
                  recurringPaymentIntervalUnit: checkout.planPeriod === 'annual' ? 'year' : 'month',
                },
              },
            }
          : undefined,
      }}
    />
  );
};

const usePaymentElement = () => {
  const { isPaymentElementReady, initializePaymentSource } = usePaymentElementContext();
  const { stripe, elements } = useStipeUtilsContext();
  const { stripe: stripeFromContext, externalClientSecret } = usePaymentElementContext();

  const submit = useCallback(async () => {
    if (!stripe || !elements) {
      throw new Error('Stripe and Elements are not yet ready');
    }

    const { setupIntent, error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: '', // TODO(@COMMERCE): need to figure this out
      },
      redirect: 'if_required',
    });
    if (error || !setupIntent?.payment_method) {
      return { data: undefined, error }; // just return, since stripe will handle the error
    }
    return {
      data: { gateway: 'stripe', paymentToken: setupIntent.payment_method as string },
      error: undefined,
    } as const;
  }, [stripe, elements]);

  const isProviderReady = stripe && externalClientSecret;

  return {
    submit,
    reset: initializePaymentSource,
    isFormReady: isPaymentElementReady,
    provider: isProviderReady
      ? {
          name: 'stripe',
          instance: stripeFromContext,
        }
      : undefined,
    isProviderReady: isProviderReady,
  };
};

export {
  PaymentElementRoot as __experimental_PaymentElementRoot,
  PaymentElementForm as __experimental_PaymentElementForm,
  usePaymentElement as __experimental_usePaymentElement,
};
