import { createContextAndHook, useOrganization, useUser } from '@clerk/shared/react';
import type { CommerceCheckoutResource } from '@clerk/types';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { Appearance as StripeAppearance, SetupIntent } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { clerkUnsupportedEnvironmentWarning } from '../../../core/errors';
import { useEnvironment, useSubscriberTypeContext } from '../../contexts';
import {
  Box,
  descriptors,
  Flex,
  localizationKeys,
  Spinner,
  Text,
  useAppearance,
  useLocalizations,
} from '../../customizables';
import { Card, Form, FormButtons, FormContainer, LineItems, useCardState } from '../../elements';
import type { LocalizationKey } from '../../localization';
import { handleError, normalizeColorString } from '../../utils';

type AddPaymentSourceProps = {
  onSuccess: (context: { stripeSetupIntent?: SetupIntent }) => Promise<void>;
  onResetPaymentIntent?: () => void;
  checkout?: CommerceCheckoutResource;
  // submitLabel?: LocalizationKey;
  cancelAction?: () => void;
  // submitError?: ClerkRuntimeError | ClerkAPIError | string | undefined;
  // setSubmitError?: (submitError: ClerkRuntimeError | ClerkAPIError | string | undefined) => void;
};

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

  const externalGatewayId = initializedPaymentSource?.externalGatewayId;
  const externalClientSecret = initializedPaymentSource?.externalClientSecret;
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
  };
};

const [AddPaymentSourceContext, useAddPaymentSourceContext] = createContextAndHook<any>('AddPaymentSourceRoot');

const AddPaymentSourceRoot = ({ children }: { children: React.ReactNode }) => {
  const { initializePaymentSource, externalClientSecret, stripe } = usePaymentSourceUtils();
  const [headerTitle, setHeaderTitle] = useState<LocalizationKey | undefined>(undefined);
  const [headerSubtitle, setHeaderSubtitle] = useState<LocalizationKey | undefined>(undefined);
  const [submitLabel, setSubmitLabel] = useState<LocalizationKey | undefined>(undefined);

  useEffect(() => {
    void initializePaymentSource();
  }, []);

  return (
    <AddPaymentSourceContext.Provider
      value={{
        value: {
          headerTitle,
          headerSubtitle,
          submitLabel,
          setHeaderTitle,
          setHeaderSubtitle,
          setSubmitLabel,
          initializePaymentSource,
          externalClientSecret,
          stripe,
        },
      }}
    >
      {children}
    </AddPaymentSourceContext.Provider>
  );
};

const AddPaymentSourceLoading = ({ children }: { children: React.ReactNode }) => {
  const { stripe, externalClientSecret } = useAddPaymentSourceContext();

  if (!stripe || !externalClientSecret) {
    return children;
  }

  return null;
};

const AddPaymentSourceReady = ({ children }: { children: React.ReactNode }) => {
  const { externalClientSecret, stripe } = useAddPaymentSourceContext();

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

  if (!stripe || !externalClientSecret) {
    return null;
  }

  return (
    <Elements
      // This key is used to reset the payment intent, since Stripe doesn't not provide a way to reset the payment intent.
      key={externalClientSecret}
      stripe={stripe}
      options={{ clientSecret: externalClientSecret, appearance: elementsAppearance }}
    >
      {children}
    </Elements>
  );
};

export const AddPaymentSource = (props: PropsWithChildren<AddPaymentSourceProps>) => {
  const {
    checkout,
    // submitLabel,
    onSuccess,
    cancelAction,
    // submitError,
    // setSubmitError,
  } = props;
  console.log(useCardState().error);

  return (
    <AddPaymentSourceRoot>
      <AddPaymentSourceLoading>
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
      </AddPaymentSourceLoading>

      <AddPaymentSourceReady>
        <AddPaymentSourceForm
          // submitLabel={submitLabel}
          onSuccess={onSuccess}
          // onResetPaymentIntent={initializePaymentSource}
          cancelAction={cancelAction}
          checkout={checkout}
          // submitError={submitError}
          // setSubmitError={setSubmitError}
        >
          {props.children}
        </AddPaymentSourceForm>
      </AddPaymentSourceReady>
    </AddPaymentSourceRoot>
  );
};

export const AddPaymentSourceFormHeader = ({ text }: { text: LocalizationKey }) => {
  const { setHeaderTitle } = useAddPaymentSourceContext();

  useRef(() => {
    setHeaderTitle(text);
  });

  useEffect(() => {
    setHeaderTitle(text);
  }, [text, setHeaderTitle]);

  return null;
};

export const AddPaymentSourceFormSubtitle = ({ text }: { text: LocalizationKey }) => {
  const { setHeaderSubtitle } = useAddPaymentSourceContext();

  useRef(() => {
    setHeaderSubtitle(text);
  });

  useEffect(() => {
    setHeaderSubtitle(text);
  }, [text, setHeaderSubtitle]);

  return null;
};

export const AddPaymentSourceFormButton = ({ text }: { text: LocalizationKey }) => {
  const { setSubmitLabel } = useAddPaymentSourceContext();

  useRef(() => {
    setSubmitLabel(text);
  });

  useEffect(() => {
    setSubmitLabel(text);
  }, [text, setSubmitLabel]);

  return null;
};

const AddPaymentSourceForm = ({
  onSuccess,
  onResetPaymentIntent,
  cancelAction,
  checkout,
  children,
}: PropsWithChildren<AddPaymentSourceProps>) => {
  const { headerTitle, headerSubtitle, submitLabel } = useAddPaymentSourceContext();
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);
  const stripe = useStripe();
  const card = useCardState();
  const elements = useElements();
  const { displayConfig } = useEnvironment();
  const { t } = useLocalizations();

  console.log('onSubmit', checkout);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    card.setLoading();
    card.setError(undefined);

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
    } catch (error) {
      void handleError(error, [], card.setError);
    } finally {
      card.setIdle();
      onResetPaymentIntent?.();
    }
  };

  return (
    <FormContainer
      headerTitle={headerTitle}
      headerSubtitle={headerSubtitle}
    >
      <Form.Root
        onSubmit={onSubmit}
        sx={t => ({
          display: 'flex',
          flexDirection: 'column',
          rowGap: t.space.$3,
        })}
      >
        {children}
        <PaymentElement
          onReady={() => setIsPaymentElementReady(true)}
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
            // TODO(@COMMERCE): Should this be fetched from the fapi?
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
        <Card.Alert>{card.error}</Card.Alert>
        <FormButtons
          isDisabled={!isPaymentElementReady}
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
};

export const TestPaymentSource = () => {
  const { t } = useLocalizations();
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
          localizationKey={localizationKeys('commerce.paymentSource.dev.testCardInfo')}
        />
        <Text
          variant='caption'
          sx={t => ({
            color: t.colors.$warning500,
            fontWeight: t.fontWeights.$semibold,
          })}
          localizationKey={localizationKeys('commerce.paymentSource.dev.developmentMode')}
        />
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
  );
};
