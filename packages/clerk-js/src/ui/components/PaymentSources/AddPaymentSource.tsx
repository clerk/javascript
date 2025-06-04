import { createContextAndHook, useOrganization, useUser } from '@clerk/shared/react';
import type { CommerceCheckoutResource } from '@clerk/types';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { Appearance as StripeAppearance, SetupIntent } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';

import { clerkUnsupportedEnvironmentWarning } from '../../../core/errors';
import { useEnvironment, useSubscriberTypeContext } from '../../contexts';
import { descriptors, Flex, localizationKeys, Spinner, useAppearance, useLocalizations } from '../../customizables';
import type { LocalizationKey } from '../../localization';
import { handleError, normalizeColorString } from '../../utils';

type AddPaymentSourceProps = {
  onSuccess: (context: { stripeSetupIntent?: SetupIntent }) => Promise<void>;
  checkout?: CommerceCheckoutResource;
  cancelAction?: () => void;
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

const [AddPaymentSourceContext, useAddPaymentSourceContext] = createContextAndHook<any>('AddPaymentSourceRoot');

const AddPaymentSourceRoot = ({ children, ...rest }: PropsWithChildren<AddPaymentSourceProps>) => {
  const { initializePaymentSource, externalClientSecret, stripe, paymentMethodOrder } = usePaymentSourceUtils();
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
          paymentMethodOrder,
          ...rest,
        },
      }}
    >
      {children}
    </AddPaymentSourceContext.Provider>
  );
};

const AddPaymentSourceLoading = (props: PropsWithChildren) => {
  const { stripe, externalClientSecret } = useAddPaymentSourceContext();

  if (!stripe || !externalClientSecret) {
    return props.children;
  }

  return null;
};

const AddPaymentSourceReady = (props: PropsWithChildren) => {
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
      {props.children}
    </Elements>
  );
};

const Root = (props: PropsWithChildren<AddPaymentSourceProps>) => {
  const { children, ...rest } = props;

  return (
    <AddPaymentSourceRoot {...rest}>
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
        <AddPaymentSourceForm>{children}</AddPaymentSourceForm>
      </AddPaymentSourceReady>
    </AddPaymentSourceRoot>
  );
};

const useSetAndSync = (text: LocalizationKey, setter: (a: any) => void) => {
  useRef(() => {
    setter(text);
  });

  useEffect(() => {
    setter(text);
  }, [text, setter]);
};

const FormHeader = ({ text }: { text: LocalizationKey }) => {
  const { setHeaderTitle } = useAddPaymentSourceContext();
  useSetAndSync(text, setHeaderTitle);
  return null;
};

const FormSubtitle = ({ text }: { text: LocalizationKey }) => {
  const { setHeaderSubtitle } = useAddPaymentSourceContext();
  useSetAndSync(text, setHeaderSubtitle);
  return null;
};

const FormButton = ({ text }: { text: LocalizationKey }) => {
  const { setSubmitLabel } = useAddPaymentSourceContext();
  useSetAndSync(text, setSubmitLabel);
  return null;
};

const AddPaymentSourceForm = ({ children }: PropsWithChildren) => {
  const {
    headerTitle,
    headerSubtitle,
    submitLabel,
    checkout,
    initializePaymentSource,
    onSuccess,
    cancelAction,
    paymentMethodOrder,
  } = useAddPaymentSourceContext();
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);
  const stripe = useStripe();
  const card = useCardState();
  const elements = useElements();
  const { displayConfig } = useEnvironment();
  const { t } = useLocalizations();

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
      initializePaymentSource(); // resets the payment intent
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
            paymentMethodOrder: paymentMethodOrder || ['card'],
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

export { Root, FormHeader, FormSubtitle, FormButton };
