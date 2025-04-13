import { useClerk, useOrganization } from '@clerk/shared/react';
import type {
  __experimental_CommerceCheckoutResource,
  __experimental_CommercePaymentSourceResource,
  ClerkAPIError,
  ClerkRuntimeError,
} from '@clerk/types';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { Appearance as StripeAppearance, Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useRef, useState } from 'react';

import { clerkUnsupportedEnvironmentWarning } from '../../../core/errors';
import { useEnvironment, usePaymentSourcesContext } from '../../contexts';
import { descriptors, Flex, localizationKeys, Spinner, useAppearance } from '../../customizables';
import { Alert, Form, FormButtons, FormContainer, withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks/useFetch';
import type { LocalizationKey } from '../../localization';
import { animations } from '../../styledSystem';
import { handleError, normalizeColorString } from '../../utils';

type AddPaymentSourceProps = {
  onSuccess: (paymentSource: __experimental_CommercePaymentSourceResource) => Promise<void>;
  checkout?: __experimental_CommerceCheckoutResource;
  submitLabel?: LocalizationKey;
  cancelAction?: () => void;
};

export const AddPaymentSource = (props: AddPaymentSourceProps) => {
  const { checkout, submitLabel, onSuccess, cancelAction } = props;
  const { __experimental_commerce } = useClerk();
  const { __experimental_commerceSettings } = useEnvironment();
  const { organization } = useOrganization();
  const { subscriberType } = usePaymentSourcesContext();

  const stripePromiseRef = useRef<Promise<Stripe | null> | null>(null);
  const [stripe, setStripe] = useState<Stripe | null>(null);

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

  // if we have a checkout, we can use the checkout's client secret and gateway id
  // otherwise, we need to initialize a new payment source
  const { data: initializedPaymentSource, invalidate } = useFetch(
    !checkout ? __experimental_commerce.initializePaymentSource : undefined,
    {
      gateway: 'stripe',
      ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
    },
    undefined,
    'commerce-payment-source-initialize',
  );

  const externalGatewayId = checkout?.externalGatewayId ?? initializedPaymentSource?.externalGatewayId;
  const externalClientSecret = checkout?.externalClientSecret ?? initializedPaymentSource?.externalClientSecret;

  useEffect(() => {
    if (!stripePromiseRef.current && externalGatewayId && __experimental_commerceSettings.stripePublishableKey) {
      if (__BUILD_DISABLE_RHC__) {
        clerkUnsupportedEnvironmentWarning('Stripe');
        return;
      }

      stripePromiseRef.current = loadStripe(__experimental_commerceSettings.stripePublishableKey, {
        stripeAccount: externalGatewayId,
      });

      void stripePromiseRef.current.then(stripeInstance => {
        setStripe(stripeInstance);
      });
    }
  }, [externalGatewayId, __experimental_commerceSettings]);

  // invalidate the initialized payment source when the component unmounts
  useEffect(() => {
    return invalidate;
  }, [invalidate]);

  if (!stripe || !externalClientSecret) {
    return (
      <Flex
        direction={'row'}
        align={'center'}
        justify={'center'}
        sx={t => ({
          width: '100%',
          minHeight: t.sizes.$60,
        })}
      >
        <Spinner
          size={'lg'}
          colorScheme={'primary'}
          elementDescriptor={descriptors.spinner}
        />
      </Flex>
    );
  }

  return (
    <Elements
      stripe={stripe}
      options={{ clientSecret: externalClientSecret, appearance: elementsAppearance }}
    >
      <AddPaymentSourceForm
        submitLabel={submitLabel}
        onSuccess={onSuccess}
        cancelAction={cancelAction}
        checkout={checkout}
      />
    </Elements>
  );
};

const AddPaymentSourceForm = withCardStateProvider(
  ({ submitLabel, onSuccess, cancelAction, checkout }: AddPaymentSourceProps) => {
    const { __experimental_commerce } = useClerk();
    const stripe = useStripe();
    const elements = useElements();
    const { displayConfig } = useEnvironment();
    const { organization } = useOrganization();
    const { subscriberType } = usePaymentSourcesContext();
    const [submitError, setSubmitError] = useState<ClerkRuntimeError | ClerkAPIError | string | undefined>();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!stripe || !elements) {
        return;
      }
      setSubmitError(undefined);

      try {
        const { setupIntent, error } = await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: '', // TODO(@COMMERCE): need to figure this out
          },
          redirect: 'if_required',
        });
        if (error) {
          return; // just return, since stripe will handle the error
        }

        const paymentSource = await __experimental_commerce.addPaymentSource({
          gateway: 'stripe',
          paymentToken: setupIntent.payment_method as string,
          ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
        });

        void onSuccess(paymentSource);
      } catch (error) {
        void handleError(error, [], setSubmitError);
      }
    };

    return (
      <FormContainer
        headerTitle={
          checkout ? localizationKeys('userProfile.__experimental_billingPage.paymentSourcesSection.add') : undefined
        }
        headerSubtitle={
          !checkout
            ? localizationKeys('userProfile.__experimental_billingPage.paymentSourcesSection.addSubtitle')
            : undefined
        }
      >
        <Form.Root
          onSubmit={onSubmit}
          sx={t => ({
            display: 'flex',
            flexDirection: 'column',
            rowGap: t.space.$3,
          })}
        >
          <PaymentElement
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
              },
              paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
              applePay: checkout
                ? {
                    recurringPaymentRequest: {
                      paymentDescription: `${checkout.planPeriod === 'month' ? 'Monthly' : 'Annual'} payment`,
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
          {submitError && (
            <Alert
              variant='danger'
              sx={t => ({
                animation: `${animations.textInBig} ${t.transitionDuration.$slow}`,
              })}
            >
              {typeof submitError === 'string' ? submitError : submitError.message}
            </Alert>
          )}
          <FormButtons
            submitLabel={
              submitLabel ??
              localizationKeys('userProfile.__experimental_billingPage.paymentSourcesSection.formButtonPrimary__add')
            }
            onReset={cancelAction}
            hideReset={!cancelAction}
            sx={{ flex: checkout ? 1 : undefined }}
          />
        </Form.Root>
      </FormContainer>
    );
  },
);
