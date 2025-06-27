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
import { Elements, PaymentElement as StripePaymentElement, useElements, useStripe } from './stripe-react';

type LoadStripeFn = typeof import('@stripe/stripe-js').loadStripe;

const [StripeLibsContext, useStripeLibsContext] = createContextAndHook<{
  loadStripe: LoadStripeFn;
} | null>('StripeLibsContext');

const StripeLibsProvider = ({ children }: PropsWithChildren) => {
  const clerk = useClerk();
  const { data: stripeClerkLibs } = useSWR(
    'clerk-stripe-sdk',
    async () => {
      const loadStripe = (await clerk.__internal_loadStripeJs()) as LoadStripeFn;
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
    initializePaymentSource().catch(() => {
      // ignore errors
    });
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
    paymentDescription?: string;
  }
>('PaymentElementContext');

const [StripeUtilsContext, useStripeUtilsContext] = createContextAndHook<{
  stripe: Stripe | undefined | null;
  elements: StripeElements | undefined | null;
}>('StripeUtilsContext');

const ValidateStripeUtils = ({ children }: PropsWithChildren) => {
  const stripe = useStripe();
  const elements = useElements();

  return <StripeUtilsContext.Provider value={{ value: { stripe, elements } }}>{children}</StripeUtilsContext.Provider>;
};

const DummyStripeUtils = ({ children }: PropsWithChildren) => {
  return <StripeUtilsContext.Provider value={{ value: {} as any }}>{children}</StripeUtilsContext.Provider>;
};

type PaymentElementConfig = {
  checkout?: CommerceCheckoutResource;
  stripeAppearance?: internalStripeAppearance;
  // TODO(@COMMERCE): What can we do to remove this ?
  for: 'org' | 'user';
  paymentDescription?: string;
};

const PaymentElementProvider = (props: PropsWithChildren<PaymentElementConfig>) => {
  return (
    <StripeLibsProvider>
      <PaymentElementInternalRoot {...props} />
    </StripeLibsProvider>
  );
};

const PaymentElementInternalRoot = (props: PropsWithChildren<PaymentElementConfig>) => {
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
          // This key is used to reset the payment intent, since Stripe doesn't provide a way to reset the payment intent.
          key={externalClientSecret}
          stripe={stripe}
          options={{
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

const PaymentElement = ({ fallback }: { fallback?: ReactNode }) => {
  const { setIsPaymentElementReady, paymentMethodOrder, checkout, stripe, externalClientSecret, paymentDescription } =
    usePaymentElementContext();
  const environment = useInternalEnvironment();

  if (!stripe || !externalClientSecret) {
    return <>{fallback}</>;
  }

  return (
    <StripePaymentElement
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
                paymentDescription: paymentDescription || '',
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
  const { stripe, elements } = useStripeUtilsContext();
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
    if (error) {
      return { data: null, error } as const;
    }
    return {
      data: { gateway: 'stripe', paymentToken: setupIntent.payment_method as string },
      error: null,
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
  PaymentElementProvider as __experimental_PaymentElementProvider,
  PaymentElement as __experimental_PaymentElement,
  usePaymentElement as __experimental_usePaymentElement,
};
