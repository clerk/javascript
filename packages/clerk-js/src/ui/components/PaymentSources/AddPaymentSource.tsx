import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { ClerkAPIError, ClerkRuntimeError, CommerceCheckoutResource } from '@clerk/types';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { Appearance as StripeAppearance, SetupIntent, Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useRef, useState } from 'react';

import { clerkUnsupportedEnvironmentWarning } from '../../../core/errors';
import { useEnvironment, useSubscriberTypeContext } from '../../contexts';
import {
  Box,
  Button,
  descriptors,
  Flex,
  localizationKeys,
  Spinner,
  Text,
  useAppearance,
  useLocalizations,
} from '../../customizables';
import { Alert, Form, FormButtons, FormContainer, LineItems, withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks/useFetch';
import type { LocalizationKey } from '../../localization';
import { animations } from '../../styledSystem';
import { handleError, normalizeColorString } from '../../utils';

type AddPaymentSourceProps = {
  onSuccess: (context: { stripeSetupIntent?: SetupIntent }) => Promise<void>;
  checkout?: CommerceCheckoutResource;
  submitLabel?: LocalizationKey;
  cancelAction?: () => void;
  submitError?: ClerkRuntimeError | ClerkAPIError | string | undefined;
  setSubmitError?: (submitError: ClerkRuntimeError | ClerkAPIError | string | undefined) => void;
  resetStripeElements?: () => void;
  onPayWithTestPaymentSourceSuccess?: () => void;
  showPayWithTestCardSection?: boolean;
};

export const AddPaymentSource = (props: AddPaymentSourceProps) => {
  const {
    checkout,
    submitLabel,
    onSuccess,
    cancelAction,
    submitError,
    setSubmitError,
    onPayWithTestPaymentSourceSuccess,
    showPayWithTestCardSection,
  } = props;
  const { commerceSettings } = useEnvironment();
  const { organization } = useOrganization();
  const { user } = useUser();
  const subscriberType = useSubscriberTypeContext();

  const resource = subscriberType === 'org' ? organization : user;

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

  const {
    data: initializedPaymentSource,
    invalidate,
    revalidate: revalidateInitializedPaymentSource,
  } = useFetch(
    resource?.initializePaymentSource,
    {
      gateway: 'stripe',
    },
    undefined,
    `commerce-payment-source-initialize-${resource?.id}`,
  );

  const externalGatewayId = initializedPaymentSource?.externalGatewayId;
  const externalClientSecret = initializedPaymentSource?.externalClientSecret;

  const stripePublishableKey = commerceSettings.billing.stripePublishableKey;

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
  }, [externalGatewayId, externalClientSecret, stripePublishableKey, commerceSettings]);

  // invalidate the initialized payment source when the component unmounts
  useEffect(() => {
    return invalidate;
  }, [invalidate]);

  const resetStripeElements = () => {
    setStripe(null);
    stripePromiseRef.current = null;
    revalidateInitializedPaymentSource?.();
  };

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
        resetStripeElements={resetStripeElements}
        onPayWithTestPaymentSourceSuccess={onPayWithTestPaymentSourceSuccess}
        showPayWithTestCardSection={showPayWithTestCardSection}
      />
    </Elements>
  );
};

const AddPaymentSourceForm = withCardStateProvider(
  ({
    submitLabel,
    onSuccess,
    cancelAction,
    checkout,
    submitError,
    setSubmitError,
    resetStripeElements,
    onPayWithTestPaymentSourceSuccess,
    showPayWithTestCardSection,
  }: AddPaymentSourceProps) => {
    const clerk = useClerk();
    const stripe = useStripe();
    const elements = useElements();
    const { displayConfig } = useEnvironment();
    const { t } = useLocalizations();

    const subscriberType = useSubscriberTypeContext();

    const resource = subscriberType === 'org' ? clerk?.organization : clerk.user;
    const { revalidate } = useFetch(
      resource?.getPaymentSources,
      {},
      undefined,
      `commerce-payment-sources-${resource?.id}`,
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

        // if onSuccess doesn't redirect us, revalidate the payment sources and reset the stripe elements in case we need to input a different payment source
        revalidate();
        resetStripeElements?.();
      } catch (error) {
        void handleError(error, [], setSubmitError);
      }
    };

    return (
      <FormContainer
        headerTitle={!checkout ? localizationKeys('userProfile.billingPage.paymentSourcesSection.add') : undefined}
        headerSubtitle={
          !checkout ? localizationKeys('userProfile.billingPage.paymentSourcesSection.addSubtitle') : undefined
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
          {showPayWithTestCardSection ? (
            <PayWithTestPaymentSource onCheckoutComplete={onPayWithTestPaymentSourceSuccess} />
          ) : (
            clerk.instanceType === 'development' && (
              <Box
                sx={t => ({
                  background: t.colors.$neutralAlpha50,
                  padding: t.space.$2x5,
                  borderRadius: t.radii.$md,
                  borderWidth: t.borderWidths.$normal,
                  borderStyle: t.borderStyles.$solid,
                  borderColor: t.colors.$neutralAlpha100,
                  display: 'flex',
                  flexDirection: 'column',
                  rowGap: t.space.$2,
                  position: 'relative',
                })}
              >
                <Box
                  sx={t => ({
                    position: 'absolute',
                    inset: 0,
                    background: `repeating-linear-gradient(-45deg,${t.colors.$warningAlpha100},${t.colors.$warningAlpha100} 6px,${t.colors.$warningAlpha150} 6px,${t.colors.$warningAlpha150} 12px)`,
                    maskImage: `linear-gradient(transparent 20%, black)`,
                    pointerEvents: 'none',
                  })}
                />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    variant='caption'
                    colorScheme='body'
                  >
                    <Text localizationKey={localizationKeys('commerce.paymentSource.dev.testCardInfo')} />
                  </Text>
                  <Text
                    variant='caption'
                    sx={t => ({
                      color: t.colors.$warning500,
                      fontWeight: t.fontWeights.$semibold,
                    })}
                  >
                    <Text localizationKey={localizationKeys('commerce.paymentSource.dev.developmentMode')} />
                  </Text>
                </Box>
                <LineItems.Root>
                  <LineItems.Group variant='tertiary'>
                    <LineItems.Title title={localizationKeys('commerce.paymentSource.dev.cardNumber')} />
                    <LineItems.Description text={'4242 4242 4242 4242'} />
                  </LineItems.Group>
                  <LineItems.Group variant='tertiary'>
                    <LineItems.Title title={localizationKeys('commerce.paymentSource.dev.expirationDate')} />
                    <LineItems.Description text={'11/44'} />
                  </LineItems.Group>
                  <LineItems.Group variant='tertiary'>
                    <LineItems.Title title={localizationKeys('commerce.paymentSource.dev.cvcZip')} />
                    <LineItems.Description text={t(localizationKeys('commerce.paymentSource.dev.anyNumbers'))} />
                  </LineItems.Group>
                </LineItems.Root>
              </Box>
            )
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
              submitLabel ?? localizationKeys('userProfile.billingPage.paymentSourcesSection.formButtonPrimary__add')
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

const PayWithTestPaymentSource = withCardStateProvider(
  ({ onCheckoutComplete }: { onCheckoutComplete?: () => void }) => {
    const clerk = useClerk();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onPaymentSourceSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsSubmitting(true);

      onCheckoutComplete?.();
    };

    if (clerk.instanceType !== 'development') {
      return null;
    }

    return (
      <Box
        sx={t => ({
          background: t.colors.$neutralAlpha50,
          padding: t.space.$2x5,
          borderRadius: t.radii.$md,
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$neutralAlpha100,
          display: 'flex',
          flexDirection: 'column',
          rowGap: t.space.$2,
          position: 'relative',
        })}
      >
        <Box
          sx={t => ({
            position: 'absolute',
            inset: 0,
            background: `repeating-linear-gradient(-45deg,${t.colors.$warningAlpha100},${t.colors.$warningAlpha100} 6px,${t.colors.$warningAlpha150} 6px,${t.colors.$warningAlpha150} 12px)`,
            maskImage: `linear-gradient(transparent 20%, black)`,
            pointerEvents: 'none',
          })}
        />
        <Flex
          sx={t => ({
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            rowGap: t.space.$2,
          })}
        >
          <Text
            sx={t => ({
              color: t.colors.$warning500,
              fontWeight: t.fontWeights.$semibold,
            })}
          >
            <Text localizationKey={localizationKeys('commerce.paymentSource.dev.developmentMode')} />
          </Text>
          <Button
            type='button'
            block
            variant='bordered'
            localizationKey={localizationKeys('userProfile.billingPage.paymentSourcesSection.payWithTestCardButton')}
            colorScheme='secondary'
            isLoading={isSubmitting}
            onClick={onPaymentSourceSubmit}
          />
        </Flex>
      </Box>
    );
  },
);
