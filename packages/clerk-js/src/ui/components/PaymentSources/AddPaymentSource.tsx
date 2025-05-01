import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { __experimental_CommerceCheckoutResource, ClerkAPIError, ClerkRuntimeError } from '@clerk/types';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { Appearance as StripeAppearance, SetupIntent, Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useRef, useState } from 'react';

import { clerkUnsupportedEnvironmentWarning } from '../../../core/errors';
import { useEnvironment, useSubscriberTypeContext } from '../../contexts';
import { Box, descriptors, Flex, localizationKeys, Spinner, Text, useAppearance } from '../../customizables';
import { Alert, Form, FormButtons, FormContainer, LineItems, withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks/useFetch';
import type { LocalizationKey } from '../../localization';
import { animations } from '../../styledSystem';
import { handleError, normalizeColorString } from '../../utils';

type AddPaymentSourceProps = {
  onSuccess: (context: { stripeSetupIntent?: SetupIntent }) => Promise<void>;
  checkout?: __experimental_CommerceCheckoutResource;
  submitLabel?: LocalizationKey;
  cancelAction?: () => void;
  submitError?: ClerkRuntimeError | ClerkAPIError | string | undefined;
  setSubmitError?: (submitError: ClerkRuntimeError | ClerkAPIError | string | undefined) => void;
};

export const AddPaymentSource = (props: AddPaymentSourceProps) => {
  const { checkout, submitLabel, onSuccess, cancelAction, submitError, setSubmitError } = props;
  const { __experimental_commerce } = useClerk();
  const { __experimental_commerceSettings } = useEnvironment();
  const { organization } = useOrganization();
  const { user } = useUser();
  const subscriberType = useSubscriberTypeContext();
  console.log('subscriberType', subscriberType);

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
    `commerce-payment-source-initialize-${user?.id}`,
  );

  const externalGatewayId = checkout?.externalGatewayId ?? initializedPaymentSource?.externalGatewayId;
  const externalClientSecret = checkout?.externalClientSecret ?? initializedPaymentSource?.externalClientSecret;

  const stripePublishableKey = __experimental_commerceSettings.billing.stripePublishableKey;

  useEffect(() => {
    if (!stripePromiseRef.current && externalGatewayId && stripePublishableKey) {
      if (__BUILD_DISABLE_RHC__) {
        clerkUnsupportedEnvironmentWarning('Stripe');
        return;
      }

      stripePromiseRef.current = loadStripe(stripePublishableKey, {
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
        submitError={submitError}
        setSubmitError={setSubmitError}
      />
    </Elements>
  );
};

const AddPaymentSourceForm = withCardStateProvider(
  ({ submitLabel, onSuccess, cancelAction, checkout, submitError, setSubmitError }: AddPaymentSourceProps) => {
    const clerk = useClerk();
    const stripe = useStripe();
    const elements = useElements();
    const { displayConfig } = useEnvironment();
    const { organization } = useOrganization();
    const { user } = useUser();
    const subscriberType = useSubscriberTypeContext();

    // Revalidates the next time the hooks gets mounted
    const { revalidate } = useFetch(
      undefined,
      {
        ...(subscriberType === 'org' ? { orgId: organization?.id } : {}),
      },
      undefined,
      `commerce-payment-sources-${user?.id}`,
    );

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!stripe || !elements) {
        return;
      }
      setSubmitError?.(undefined);

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

        await onSuccess({ stripeSetupIntent: setupIntent });

        revalidate();
      } catch (error) {
        void handleError(error, [], setSubmitError);
      }
    };

    return (
      <FormContainer
        headerTitle={
          !checkout ? localizationKeys('userProfile.__experimental_billingPage.paymentSourcesSection.add') : undefined
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
          {clerk.instanceType === 'development' && (
            <Box
              sx={t => ({
                background: t.colors.$neutralAlpha50,
                paddingInline: t.space.$2,
                paddingBlock: t.space.$1x5,
                borderRadius: t.radii.$md,
                borderWidth: t.borderWidths.$normal,
                borderStyle: t.borderStyles.$solid,
                borderColor: t.colors.$neutralAlpha100,
                display: 'flex',
                flexDirection: 'column',
                rowGap: t.space.$2,
              })}
            >
              <Text
                variant='caption'
                colorScheme='body'
              >
                Test card information
              </Text>
              <LineItems.Root>
                <LineItems.Group variant='tertiary'>
                  <LineItems.Title title={'Card number'} />
                  <LineItems.Description text={'4242 4242 4242 4242'} />
                </LineItems.Group>
                <LineItems.Group variant='tertiary'>
                  <LineItems.Title title={'Expiration date'} />
                  <LineItems.Description text={'11/44'} />
                </LineItems.Group>
                <LineItems.Group variant='tertiary'>
                  <LineItems.Title title={'CVC, ZIP'} />
                  <LineItems.Description text={'Any numbers'} />
                </LineItems.Group>
              </LineItems.Root>
            </Box>
          )}
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
