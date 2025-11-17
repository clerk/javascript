import type { useCheckout } from '@clerk/shared/react';
import { createContextAndHook, PaymentElement, PaymentElementProvider, usePaymentElement } from '@clerk/shared/react';
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { resolveComputedCSSColor, resolveComputedCSSProperty } from '@/ui/utils/cssVariables';
import { handleError } from '@/ui/utils/errorHandler';

import { useSubscriberTypeContext, useSubscriberTypeLocalizationRoot } from '../../contexts';
import { descriptors, Flex, localizationKeys, Spinner, useAppearance, useLocalizations } from '../../customizables';
import type { LocalizationKey } from '../../localization';
import { PaymentElementSkeleton } from './PaymentElementSkeleton';

const useStripeAppearance = (node: HTMLElement | null) => {
  const theme = useAppearance().parsedInternalTheme;

  return useMemo(() => {
    if (!node) {
      return undefined;
    }
    const { colors, fontWeights, fontSizes, radii, space } = theme;
    return {
      colorPrimary: resolveComputedCSSColor(node, colors.$primary500, colors.$colorBackground),
      colorBackground: resolveComputedCSSColor(node, colors.$colorInput, colors.$colorBackground),
      colorText: resolveComputedCSSColor(node, colors.$colorForeground, colors.$colorBackground),
      colorTextSecondary: resolveComputedCSSColor(node, colors.$colorMutedForeground, colors.$colorBackground),
      colorSuccess: resolveComputedCSSColor(node, colors.$success500, colors.$colorBackground),
      colorDanger: resolveComputedCSSColor(node, colors.$danger500, colors.$colorBackground),
      colorWarning: resolveComputedCSSColor(node, colors.$warning500, colors.$colorBackground),
      fontWeightNormal: resolveComputedCSSProperty(node, 'font-weight', fontWeights.$normal.toString()),
      fontWeightMedium: resolveComputedCSSProperty(node, 'font-weight', fontWeights.$medium.toString()),
      fontWeightBold: resolveComputedCSSProperty(node, 'font-weight', fontWeights.$bold.toString()),
      fontSizeXl: resolveComputedCSSProperty(node, 'font-size', fontSizes.$xl),
      fontSizeLg: resolveComputedCSSProperty(node, 'font-size', fontSizes.$lg),
      fontSizeSm: resolveComputedCSSProperty(node, 'font-size', fontSizes.$md),
      fontSizeXs: resolveComputedCSSProperty(node, 'font-size', fontSizes.$sm),
      borderRadius: resolveComputedCSSProperty(node, 'border-radius', radii.$lg),
      spacingUnit: resolveComputedCSSProperty(node, 'padding', space.$1),
    };
  }, [theme, node]);
};

type AddPaymentMethodProps = {
  onSuccess: (context: { gateway: 'stripe'; paymentToken: string }) => Promise<void>;
  checkout?: ReturnType<typeof useCheckout>['checkout'];
  cancelAction?: () => void;
};

const [AddPaymentMethodContext, useAddPaymentMethodContext] = createContextAndHook<
  AddPaymentMethodProps & {
    headerTitle: LocalizationKey | undefined;
    headerSubtitle: LocalizationKey | undefined;
    submitLabel: LocalizationKey | undefined;
    setHeaderTitle: (title: LocalizationKey) => void;
    setHeaderSubtitle: (subtitle: LocalizationKey) => void;
    setSubmitLabel: (label: LocalizationKey) => void;
    onSuccess: (context: { gateway: 'stripe'; paymentToken: string }) => Promise<void>;
  }
>('AddPaymentMethodRoot');

const AddPaymentMethodRoot = ({ children, checkout, ...rest }: PropsWithChildren<AddPaymentMethodProps>) => {
  const subscriberType = useSubscriberTypeContext();
  const stripeAppearanceNode = useRef<HTMLDivElement | null>(null);
  const { t } = useLocalizations();
  const [headerTitle, setHeaderTitle] = useState<LocalizationKey | undefined>(undefined);
  const [headerSubtitle, setHeaderSubtitle] = useState<LocalizationKey | undefined>(undefined);
  const [submitLabel, setSubmitLabel] = useState<LocalizationKey | undefined>(undefined);
  const stripeAppearance = useStripeAppearance(stripeAppearanceNode.current);

  return (
    <AddPaymentMethodContext.Provider
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
      <div
        ref={stripeAppearanceNode}
        style={{ display: 'none' }}
      />
      <PaymentElementProvider
        checkout={checkout}
        for={subscriberType}
        stripeAppearance={stripeAppearance}
        paymentDescription={t(
          localizationKeys(
            checkout?.planPeriod === 'month'
              ? 'billing.paymentMethod.applePayDescription.monthly'
              : 'billing.paymentMethod.applePayDescription.annual',
          ),
        )}
      >
        {children}
      </PaymentElementProvider>
    </AddPaymentMethodContext.Provider>
  );
};

const AddPaymentMethodLoading = (props: PropsWithChildren) => {
  const { isProviderReady } = usePaymentElement();

  if (!isProviderReady) {
    return props.children;
  }

  return null;
};

const AddPaymentMethodReady = (props: PropsWithChildren) => {
  const { isProviderReady } = usePaymentElement();

  if (!isProviderReady) {
    return null;
  }

  return <>{props.children}</>;
};

const Root = (props: PropsWithChildren<AddPaymentMethodProps>) => {
  const { children, ...rest } = props;

  return (
    <AddPaymentMethodRoot {...rest}>
      <AddPaymentMethodLoading>
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
      </AddPaymentMethodLoading>

      <AddPaymentMethodReady>
        <AddPaymentMethodForm>{children}</AddPaymentMethodForm>
      </AddPaymentMethodReady>
    </AddPaymentMethodRoot>
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
  const { setHeaderTitle } = useAddPaymentMethodContext();
  useSetAndSync(text, setHeaderTitle);
  return null;
};

const FormSubtitle = ({ text }: { text: LocalizationKey }) => {
  const { setHeaderSubtitle } = useAddPaymentMethodContext();
  useSetAndSync(text, setHeaderSubtitle);
  return null;
};

const FormButton = ({ text }: { text: LocalizationKey }) => {
  const { setSubmitLabel } = useAddPaymentMethodContext();
  useSetAndSync(text, setSubmitLabel);
  return null;
};

const AddPaymentMethodForm = ({ children }: PropsWithChildren) => {
  const { headerTitle, headerSubtitle, submitLabel, checkout, onSuccess, cancelAction } = useAddPaymentMethodContext();
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
    } catch (error: any) {
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
        <PaymentElement fallback={<PaymentElementSkeleton />} />
        <Card.Alert>{card.error}</Card.Alert>
        <FormButtons
          isDisabled={!isFormReady}
          submitLabel={
            submitLabel ??
            localizationKeys(`${localizationRoot}.billingPage.paymentMethodsSection.formButtonPrimary__add`)
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
