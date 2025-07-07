/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { CommerceCheckoutResource, EnvironmentResource } from '@clerk/types';
import type { Stripe, StripeElements } from '@stripe/stripe-js';
import { type PropsWithChildren, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import React from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { createContextAndHook } from './hooks/createContextAndHook';
import type { useCheckout } from './hooks/useCheckout';
import { useClerk } from './hooks/useClerk';
import { useOrganization } from './hooks/useOrganization';
import { useUser } from './hooks/useUser';
import { Elements, PaymentElement as StripePaymentElement, useElements, useStripe } from './stripe-react';

type LoadStripeFn = typeof import('@stripe/stripe-js').loadStripe;

type PaymentElementError = {
  gateway: 'stripe';
  error: {
    /**
     * For some errors that could be handled programmatically, a short string indicating the [error code](https://stripe.com/docs/error-codes) reported.
     */
    code?: string;
    message?: string;
    type: string;
  };
};

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

type PaymentElementProviderProps = {
  checkout?: CommerceCheckoutResource | ReturnType<typeof useCheckout>;
  stripeAppearance?: internalStripeAppearance;
  // TODO(@COMMERCE): What can we do to remove this ?
  for: 'org' | 'user';
  paymentDescription?: string;
};

const [PaymentElementContext, usePaymentElementContext] = createContextAndHook<
  ReturnType<typeof usePaymentSourceUtils> &
    PaymentElementProviderProps & {
      setIsPaymentElementReady: (isPaymentElementReady: boolean) => void;
      isPaymentElementReady: boolean;
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

const PropsProvider = ({ children, ...props }: PropsWithChildren<PaymentElementProviderProps>) => {
  const utils = usePaymentSourceUtils(props.for);
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);
  return (
    <PaymentElementContext.Provider
      value={{
        value: {
          ...utils,
          setIsPaymentElementReady,
          isPaymentElementReady,
          checkout: props.checkout,
          paymentDescription: props.paymentDescription,
          for: props.for,
        },
      }}
    >
      {children}
    </PaymentElementContext.Provider>
  );
};

const PaymentElementProvider = ({ children, ...props }: PropsWithChildren<PaymentElementProviderProps>) => {
  return (
    <StripeLibsProvider>
      <PropsProvider {...props}>
        <PaymentElementInternalRoot>{children}</PaymentElementInternalRoot>
      </PropsProvider>
    </StripeLibsProvider>
  );
};

const PaymentElementInternalRoot = (props: PropsWithChildren) => {
  const { stripe, externalClientSecret, stripeAppearance } = usePaymentElementContext();

  if (stripe && externalClientSecret) {
    return (
      <Elements
        // This key is used to reset the payment intent, since Stripe doesn't provide a way to reset the payment intent.
        key={externalClientSecret}
        stripe={stripe}
        options={{
          clientSecret: externalClientSecret,
          appearance: {
            variables: stripeAppearance,
          },
        }}
      >
        <ValidateStripeUtils>{props.children}</ValidateStripeUtils>
      </Elements>
    );
  }

  return <DummyStripeUtils>{props.children}</DummyStripeUtils>;
};

const PaymentElement = ({ fallback }: { fallback?: ReactNode }) => {
  const {
    setIsPaymentElementReady,
    paymentMethodOrder,
    checkout,
    stripe,
    externalClientSecret,
    paymentDescription,
    for: subscriberType,
  } = usePaymentElementContext();
  const environment = useInternalEnvironment();

  const applePay = useMemo(() => {
    if (!checkout || !checkout.totals || !checkout.plan) {
      return undefined;
    }

    return {
      recurringPaymentRequest: {
        paymentDescription: paymentDescription || '',
        managementURL:
          subscriberType === 'org'
            ? environment?.displayConfig.organizationProfileUrl || ''
            : environment?.displayConfig.userProfileUrl || '',
        regularBilling: {
          amount: checkout.totals.totalDueNow?.amount || checkout.totals.grandTotal.amount,
          label: checkout.plan.name,
          recurringPaymentIntervalUnit: checkout.planPeriod === 'annual' ? 'year' : 'month',
        },
      },
    } as const;
  }, [checkout, paymentDescription, subscriberType, environment]);

  const options = useMemo(() => {
    return {
      layout: {
        type: 'tabs',
        defaultCollapsed: false,
      },
      paymentMethodOrder,
      applePay,
    } as const;
  }, [applePay, paymentMethodOrder]);

  const onReady = useCallback(() => {
    setIsPaymentElementReady(true);
  }, [setIsPaymentElementReady]);

  if (!stripe || !externalClientSecret) {
    return <>{fallback}</>;
  }

  return (
    <StripePaymentElement
      fallback={fallback}
      onReady={onReady}
      options={options}
    />
  );
};

const throwLibsMissingError = () => {
  throw new Error(
    'Clerk: Unable to submit, Stripe libraries are not yet loaded. Be sure to check `isFormReady` before calling `submit`.',
  );
};

type UsePaymentElementReturn = {
  submit: () => Promise<
    | {
        data: { gateway: 'stripe'; paymentToken: string };
        error: null;
      }
    | {
        data: null;
        error: PaymentElementError;
      }
  >;
  reset: () => Promise<void>;
  isFormReady: boolean;
} & (
  | {
      provider: {
        name: 'stripe';
      };
      isProviderReady: true;
    }
  | {
      provider: undefined;
      isProviderReady: false;
    }
);

const usePaymentElement = (): UsePaymentElementReturn => {
  const { isPaymentElementReady, initializePaymentSource } = usePaymentElementContext();
  const { stripe, elements } = useStripeUtilsContext();
  const { externalClientSecret } = usePaymentElementContext();

  const submit = useCallback(async () => {
    if (!stripe || !elements) {
      return throwLibsMissingError();
    }

    const { setupIntent, error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });
    if (error) {
      return {
        data: null,
        error: {
          gateway: 'stripe',
          error: {
            code: error.code,
            message: error.message,
            type: error.type,
          },
        },
      } as const;
    }
    return {
      data: { gateway: 'stripe', paymentToken: setupIntent.payment_method as string },
      error: null,
    } as const;
  }, [stripe, elements]);

  const reset = useCallback(async () => {
    if (!stripe || !elements) {
      return throwLibsMissingError();
    }

    await initializePaymentSource();
  }, [stripe, elements, initializePaymentSource]);

  const isProviderReady = Boolean(stripe && externalClientSecret);

  if (!isProviderReady) {
    return {
      submit: throwLibsMissingError,
      reset: throwLibsMissingError,
      isFormReady: false,
      provider: undefined,
      isProviderReady: false,
    };
  }
  return {
    submit,
    reset,
    isFormReady: isPaymentElementReady,
    provider: {
      name: 'stripe',
    },
    isProviderReady: isProviderReady,
  };
};

export {
  PaymentElementProvider as __experimental_PaymentElementProvider,
  PaymentElement as __experimental_PaymentElement,
  usePaymentElement as __experimental_usePaymentElement,
};
