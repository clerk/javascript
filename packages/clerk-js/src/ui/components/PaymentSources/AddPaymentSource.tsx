import {
  __experimental_PaymentElement as PaymentElement,
  __experimental_PaymentElementProvider as PaymentElementProvider,
  __experimental_usePaymentElement as usePaymentElement,
  createContextAndHook,
} from '@clerk/shared/react';
import type { CommerceCheckoutResource } from '@clerk/types';
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { handleError } from '@/ui/utils/errorHandler';
import { normalizeColorString } from '@/ui/utils/normalizeColorString';

import { useSubscriberTypeContext, useSubscriberTypeLocalizationRoot } from '../../contexts';
import { descriptors, Flex, localizationKeys, Spinner, useAppearance, useLocalizations } from '../../customizables';
import type { LocalizationKey } from '../../localization';

const useStripeAppearance = () => {
  const theme = useAppearance().parsedInternalTheme;

  return useMemo(() => {
    const { colors, fontWeights, fontSizes, radii, space } = theme;
    return {
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
    };
  }, [theme]);
};

type AddPaymentSourceProps = {
  onSuccess: (context: { gateway: 'stripe'; paymentToken: string }) => Promise<void>;
  checkout?: CommerceCheckoutResource;
  cancelAction?: () => void;
};

const [AddPaymentSourceContext, useAddPaymentSourceContext] = createContextAndHook<
  AddPaymentSourceProps & {
    headerTitle: LocalizationKey | undefined;
    headerSubtitle: LocalizationKey | undefined;
    submitLabel: LocalizationKey | undefined;
    setHeaderTitle: (title: LocalizationKey) => void;
    setHeaderSubtitle: (subtitle: LocalizationKey) => void;
    setSubmitLabel: (label: LocalizationKey) => void;
    onSuccess: (context: { gateway: 'stripe'; paymentToken: string }) => Promise<void>;
  }
>('AddPaymentSourceRoot');

const AddPaymentSourceRoot = ({ children, checkout, ...rest }: PropsWithChildren<AddPaymentSourceProps>) => {
  const subscriberType = useSubscriberTypeContext();
  const { t } = useLocalizations();
  const [headerTitle, setHeaderTitle] = useState<LocalizationKey | undefined>(undefined);
  const [headerSubtitle, setHeaderSubtitle] = useState<LocalizationKey | undefined>(undefined);
  const [submitLabel, setSubmitLabel] = useState<LocalizationKey | undefined>(undefined);
  const stripeAppearance = useStripeAppearance();

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
          checkout,
          ...rest,
        },
      }}
    >
      <PaymentElementProvider
        checkout={checkout}
        for={subscriberType}
        stripeAppearance={stripeAppearance}
        paymentDescription={t(
          localizationKeys(
            checkout?.planPeriod === 'month'
              ? 'commerce.paymentSource.applePayDescription.monthly'
              : 'commerce.paymentSource.applePayDescription.annual',
          ),
        )}
      >
        {children}
      </PaymentElementProvider>
    </AddPaymentSourceContext.Provider>
  );
};

const AddPaymentSourceLoading = (props: PropsWithChildren) => {
  const { isProviderReady } = usePaymentElement();

  if (!isProviderReady) {
    return props.children;
  }

  return null;
};

const AddPaymentSourceReady = (props: PropsWithChildren) => {
  const { isProviderReady } = usePaymentElement();

  if (!isProviderReady) {
    return null;
  }

  return <>{props.children}</>;
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
  const { headerTitle, headerSubtitle, submitLabel, checkout, onSuccess, cancelAction } = useAddPaymentSourceContext();
  const card = useCardState();
  const localizationRoot = useSubscriberTypeLocalizationRoot();

  const { isFormReady, submit: submitPaymentElement, reset } = usePaymentElement();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    card.setLoading();
    card.setError(undefined);

    const { data, error } = await submitPaymentElement();
    if (error) {
      return; // just return, since stripe will handle the error
    }
    try {
      await onSuccess(data);
    } catch (error) {
      void handleError(error, [], card.setError);
    } finally {
      card.setIdle();
      void reset(); // resets the payment intent
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
        <PaymentElement />
        <Card.Alert>{card.error}</Card.Alert>
        <FormButtons
          isDisabled={!isFormReady}
          submitLabel={
            submitLabel ??
            localizationKeys(`${localizationRoot}.billingPage.paymentSourcesSection.formButtonPrimary__add`)
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
