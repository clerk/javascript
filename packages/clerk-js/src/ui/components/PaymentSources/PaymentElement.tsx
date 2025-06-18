import { createContextAndHook, useOrganization, useUser } from '@clerk/shared/react';
import type { CommerceCheckoutResource } from '@clerk/types';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { Appearance as StripeAppearance } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { type PropsWithChildren, useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { localizationKeys, useAppearance, useLocalizations } from '@/ui/customizables';
import { normalizeColorString } from '@/ui/utils/normalizeColorString';

import { clerkUnsupportedEnvironmentWarning } from '../../../core/errors';
import { useEnvironment, useSubscriberTypeContext } from '../../contexts';

const usePaymentSourceUtils = () => {
  const { organization } = useOrganization();
  const { user } = useUser();
  const subscriberType = useSubscriberTypeContext();
  const resource = subscriberType === 'org' ? organization : user;

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
  const { commerceSettings } = useEnvironment();

  useEffect(() => {
    void initializePaymentSource();
  }, []);

  const externalGatewayId = initializedPaymentSource?.externalGatewayId;
  const externalClientSecret = initializedPaymentSource?.externalClientSecret;
  const paymentMethodOrder = initializedPaymentSource?.paymentMethodOrder;
  const stripePublishableKey = commerceSettings.billing.stripePublishableKey;

  const { data: stripe } = useSWR(
    externalGatewayId && stripePublishableKey ? { key: 'stripe-sdk', externalGatewayId, stripePublishableKey } : null,
    ({ stripePublishableKey, externalGatewayId }) => {
      if (__BUILD_DISABLE_RHC__) {
        clerkUnsupportedEnvironmentWarning('Stripe');
        return;
      }
      return loadStripe(stripePublishableKey, {
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

const useStipeAppearance = () => {
  const { colors, fontWeights, fontSizes, radii, space } = useAppearance().parsedInternalTheme;
  const elementsAppearance: StripeAppearance = {
    variables: {
      colorPrimary: normalizeColorString(colors.$primary500),
      colorBackground: normalizeColorString(colors.$colorInputBackground),
      colorText: normalizeColorString(colors.$colorText),
      colorTextSecondary: normalizeColorString(colors.$colorTextSecondary),
      colorSuccess: normalizeColorString(colors.$success500),
      colorDanger: normalizeColorString(colors.$danger500),
      colorWarning: normalizeColorString(colors.$warning500),
      fontWeightNormal: fontWeights.$normal.toString(),
      fontWeightMedium: fontWeights.$medium.toString(),
      fontWeightBold: fontWeights.$bold.toString(),
      fontSizeXl: fontSizes.$xl,
      fontSizeLg: fontSizes.$lg,
      fontSizeSm: fontSizes.$md,
      fontSizeXs: fontSizes.$sm,
      borderRadius: radii.$md,
      spacingUnit: space.$1,
    },
  };

  return elementsAppearance;
};

const [PaymentElementContext, usePaymentElementContext] = createContextAndHook<
  ReturnType<typeof usePaymentSourceUtils> & {
    // onSuccess: (params: { gateway: 'stripe'; paymentToken: string }) => Promise<void>;
    setIsPaymentElementReady: (isPaymentElementReady: boolean) => void;
    isPaymentElementReady: boolean;
    checkout?: CommerceCheckoutResource;
  }
>('AddPaymentSourceRoot');

const PaymentElementRoot = (
  props: PropsWithChildren<{
    checkout?: CommerceCheckoutResource;
    onSuccess: (params: { gateway: 'stripe'; paymentToken: string }) => Promise<void>;
  }>,
) => {
  const utils = usePaymentSourceUtils();
  const { stripe, externalClientSecret } = utils;
  const elementsAppearance = useStipeAppearance();
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);

  if (stripe && externalClientSecret) {
    return (
      <PaymentElementContext.Provider
        value={{
          value: {
            ...utils,
            //   onSuccess: props.onSuccess,
            setIsPaymentElementReady,
            isPaymentElementReady,
            checkout: props.checkout,
          },
        }}
      >
        <Elements
          // This key is used to reset the payment intent, since Stripe doesn't not provide a way to reset the payment intent.
          key={externalClientSecret}
          stripe={stripe}
          options={{ clientSecret: externalClientSecret, appearance: elementsAppearance }}
        >
          {props.children}
        </Elements>
      </PaymentElementContext.Provider>
    );
  }

  return (
    <PaymentElementContext.Provider
      value={{
        value: {
          ...utils,
          //   onSuccess: props.onSuccess,
          setIsPaymentElementReady,
          isPaymentElementReady,
          checkout: props.checkout,
        },
      }}
    >
      {props.children}
    </PaymentElementContext.Provider>
  );
};

const PaymentElementForm = () => {
  const { setIsPaymentElementReady, paymentMethodOrder, checkout, stripe, externalClientSecret } =
    usePaymentElementContext();
  const { displayConfig } = useEnvironment();
  const { t } = useLocalizations();

  if (!stripe || !externalClientSecret) {
    return null;
  }

  return (
    <PaymentElement
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
                paymentDescription: `${t(localizationKeys(checkout.planPeriod === 'month' ? 'commerce.paymentSource.applePayDescription.monthly' : 'commerce.paymentSource.applePayDescription.annual'))}`,
                managementURL: displayConfig.homeUrl, // TODO(@COMMERCE): is this the right URL?
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

// const usePaymentElement = () => {
//   const {
//     // onSuccess,
//     isPaymentElementReady,
//   } = usePaymentElementContext();
//   const stripe = useStripe();
//   const elements = useElements();

//   if (!stripe || !elements) {
//     throw new Error('Wait for initialization');
//   }

//   const submit = useCallback(async () => {
//     const { setupIntent, error } = await stripe.confirmSetup({
//       elements,
//       confirmParams: {
//         return_url: '', // TODO(@COMMERCE): need to figure this out
//       },
//       redirect: 'if_required',
//     });
//     if (error || !setupIntent?.payment_method) {
//       return { data: undefined, error }; // just return, since stripe will handle the error
//     }
//     return { data: { gateway: 'stripe', paymentToken: setupIntent.payment_method as string }, error: undefined };
//   }, [stripe, elements]);

//   return {
//     submit,
//     isPaymentElementReady,
//   };
// };

const usePaymentElementStatus = () => {
  const { stripe, externalClientSecret } = usePaymentElementContext();

  if (stripe && externalClientSecret) {
    return {
      provider: {
        name: 'stripe',
        instance: stripe,
      },
      isProviderReady: true,
    };
  }

  return {
    provider: undefined,
    isProviderReady: false,
  };
};

const usePaymentElementForm = () => {
  const { isPaymentElementReady } = usePaymentElementContext();
  const stripe = useStripe();
  const elements = useElements();

  if (!stripe || !elements) {
    throw new Error('Wait for initialization');
  }

  const submit = useCallback(async () => {
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
    return { data: { gateway: 'stripe', paymentToken: setupIntent.payment_method as string }, error: undefined };
  }, [stripe, elements]);
  return {
    submit,
    isMounted: isPaymentElementReady,
  };
};

export {
  PaymentElementRoot as Root,
  PaymentElementForm as Form,
  // usePaymentElement
  usePaymentElementStatus,
  usePaymentElementForm,
};
