import type { Stripe, StripeElements, StripeElementsOptions } from '@stripe/stripe-js';
import React, { type PropsWithChildren, type ReactNode, useCallback, useMemo, useState } from 'react';

import type { BillingCheckoutResource, EnvironmentResource, ForPayerType } from '../../types';
import { createContextAndHook } from '../hooks/createContextAndHook';
import type { useCheckout } from '../hooks/useCheckout';
import { useClerk } from '../hooks/useClerk';
import { Elements, PaymentElement as StripePaymentElement, useElements, useStripe } from '../stripe-react';
import {
  __internal_useInitializePaymentMethod as useInitializePaymentMethod,
  type UseInitializePaymentMethodResult,
} from './useInitializePaymentMethod';
import { __internal_useStripeClerkLibs as useStripeClerkLibs } from './useStripeClerkLibs';
import { __internal_useStripeLoader as useStripeLoader, type UseStripeLoaderResult } from './useStripeLoader';

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

const useInternalEnvironment = () => {
  const clerk = useClerk();
  // @ts-expect-error `__unstable__environment` is not typed
  return clerk.__unstable__environment as unknown as EnvironmentResource | null | undefined;
};

const useLocalization = () => {
  const clerk = useClerk();

  let locale = 'en';
  try {
    const localization = clerk.__internal_getOption('localization');
    locale = localization?.locale || 'en';
  } catch {
    // ignore errors
  }

  // Normalize locale to 2-letter language code for Stripe compatibility
  const normalizedLocale = locale.split('-')[0];

  return normalizedLocale;
};

const usePaymentSourceUtils = (forResource: ForPayerType = 'user') => {
  const stripeClerkLibs = useStripeClerkLibs();
  const environment = useInternalEnvironment();

  const { initializedPaymentMethod, initializePaymentMethod }: UseInitializePaymentMethodResult =
    useInitializePaymentMethod({ for: forResource });

  const stripePublishableKey = environment?.commerceSettings.billing.stripePublishableKey ?? undefined;

  const stripe: UseStripeLoaderResult = useStripeLoader({
    stripeClerkLibs,
    externalGatewayId: initializedPaymentMethod?.externalGatewayId,
    stripePublishableKey,
  });

  const externalClientSecret = initializedPaymentMethod?.externalClientSecret;
  const paymentMethodOrder = initializedPaymentMethod?.paymentMethodOrder;

  return {
    stripe,
    initializePaymentMethod,
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

/**
 * @interface
 */
export type PaymentElementProviderProps = {
  /**
   * An optional checkout resource object. When provided, the payment element is scoped to the specific checkout session.
   */
  checkout?: BillingCheckoutResource | ReturnType<typeof useCheckout>['checkout'];
  /**
   * An optional object to customize the appearance of the Stripe Payment Element. This allows you to match the form's styling to your application's theme.
   */
  stripeAppearance?: internalStripeAppearance;
  /**
   * Specifies whether to fetch for the current user or Organization.
   *
   * @default 'user'
   */
  for?: ForPayerType;
  /**
   * An optional description to display to the user within the payment element UI.
   */
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
          ...props,
          ...utils,
          setIsPaymentElementReady,
          isPaymentElementReady,
        },
      }}
    >
      {children}
    </PaymentElementContext.Provider>
  );
};

const PaymentElementProvider = ({ children, ...props }: PropsWithChildren<PaymentElementProviderProps>) => {
  return (
    <PropsProvider {...props}>
      <PaymentElementInternalRoot>{children}</PaymentElementInternalRoot>
    </PropsProvider>
  );
};

const PaymentElementInternalRoot = (props: PropsWithChildren) => {
  const { stripe, externalClientSecret, stripeAppearance } = usePaymentElementContext();
  const locale = useLocalization();

  if (stripe && externalClientSecret) {
    return (
      <Elements
        // This key is used to reset the payment intent, since Stripe doesn't provide a way to reset the payment intent.
        key={externalClientSecret}
        stripe={stripe}
        options={{
          loader: 'never',
          clientSecret: externalClientSecret,
          appearance: {
            variables: stripeAppearance,
          },
          locale: locale as StripeElementsOptions['locale'],
        }}
      >
        <ValidateStripeUtils>{props.children}</ValidateStripeUtils>
      </Elements>
    );
  }

  return <DummyStripeUtils>{props.children}</DummyStripeUtils>;
};

/**
 * @interface
 */
export type PaymentElementProps = {
  /**
   * Optional fallback content, such as a loading skeleton, to display while the payment form is being initialized.
   */
  fallback?: ReactNode;
};

const PaymentElement = ({ fallback }: PaymentElementProps) => {
  const {
    setIsPaymentElementReady,
    paymentMethodOrder,
    checkout,
    stripe,
    externalClientSecret,
    paymentDescription,
    for: _for,
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
          _for === 'organization'
            ? environment?.displayConfig.organizationProfileUrl || ''
            : environment?.displayConfig.userProfileUrl || '',
        regularBilling: {
          amount: checkout.totals.totalDueNow?.amount || checkout.totals.grandTotal.amount,
          label: checkout.plan.name,
          recurringPaymentIntervalUnit: checkout.planPeriod === 'annual' ? 'year' : 'month',
        },
      },
    } as const;
  }, [checkout, paymentDescription, _for, environment]);

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

/**
 * @interface
 */
export type UsePaymentElementReturn = {
  /**
   * A function that submits the payment form data to the payment provider. It returns a promise that resolves with either a `data` object containing a payment token on success, or an `error` object on failure.
   */
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
  /**
   * A function that resets the payment form to its initial, empty state.
   */
  reset: () => Promise<void>;
  /**
   * A boolean that indicates if the payment form UI has been rendered and is ready for user input. This is useful for disabling a submit button until the form is interactive.
   */
  isFormReady: boolean;
} & (
  | {
      /**
       * An object containing information about the initialized payment provider. It is `undefined` until `isProviderReady` is `true`.
       */
      provider: {
        name: 'stripe';
      };
      /**
       * A boolean that indicates if the underlying payment provider (e.g. Stripe) has been fully initialized.
       */
      isProviderReady: true;
    }
  | {
      provider: undefined;
      isProviderReady: false;
    }
);

const usePaymentElement = (): UsePaymentElementReturn => {
  const { isPaymentElementReady, initializePaymentMethod } = usePaymentElementContext();
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

    await initializePaymentMethod();
  }, [stripe, elements, initializePaymentMethod]);

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
  PaymentElement as __experimental_PaymentElement,
  PaymentElementProvider as __experimental_PaymentElementProvider,
  usePaymentElement as __experimental_usePaymentElement,
};
