import { useClerk } from '@clerk/shared/react';
import type {
  __experimental_CommerceCheckoutResource,
  __experimental_CommerceMoney,
  __experimental_CommercePaymentSourceResource,
  ClerkAPIError,
  ClerkRuntimeError,
} from '@clerk/types';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { Appearance as StripeAppearance, Stripe } from '@stripe/stripe-js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Button, Col, descriptors, Flex, Form, Icon, Text, useAppearance } from '../../customizables';
import { Alert, Disclosure, Divider, Drawer, LineItems, Select, SelectButton, SelectOptionList } from '../../elements';
import { useFetch } from '../../hooks';
import { ArrowUpDown, CreditCard } from '../../icons';
import { animations } from '../../styledSystem';
import { handleError, normalizeColorString } from '../../utils';

export const CheckoutForm = ({
  stripe,
  checkout,
  onCheckoutComplete,
}: {
  stripe: Stripe | null;
  checkout: __experimental_CommerceCheckoutResource;
  onCheckoutComplete: (checkout: __experimental_CommerceCheckoutResource) => void;
}) => {
  const { plan, planPeriod, totals } = checkout;
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
  return (
    <Drawer.Body>
      <Box
        elementDescriptor={descriptors.checkoutFormLineItemsRoot}
        sx={t => ({
          padding: t.space.$4,
          borderBottomWidth: t.borderWidths.$normal,
          borderBottomStyle: t.borderStyles.$solid,
          borderBottomColor: t.colors.$neutralAlpha100,
        })}
      >
        <LineItems.Root>
          <LineItems.Group>
            <LineItems.Title title={plan.name} />
            {/* TODO(@Commerce): needs localization */}
            <LineItems.Description
              text={`${plan.currencySymbol} ${planPeriod === 'month' ? plan.amountFormatted : plan.annualMonthlyAmountFormatted}`}
              suffix={`per month${planPeriod === 'annual' ? ', times 12 months' : ''}`}
            />
          </LineItems.Group>
          <LineItems.Group
            borderTop
            variant='tertiary'
          >
            {/* TODO(@Commerce): needs localization */}
            <LineItems.Title title='Subtotal' />
            <LineItems.Description text={`${totals.subtotal.currencySymbol} ${totals.subtotal.amountFormatted}`} />
          </LineItems.Group>
          <LineItems.Group variant='tertiary'>
            {/* TODO(@Commerce): needs localization */}
            <LineItems.Title title='Tax' />
            <LineItems.Description text={`${totals.taxTotal.currencySymbol} ${totals.taxTotal.amountFormatted}`} />
          </LineItems.Group>
          <LineItems.Group borderTop>
            {/* TODO(@Commerce): needs localization */}
            <LineItems.Title title={`Total${totals.totalDueNow ? ' Due Today' : ''}`} />
            <LineItems.Description
              text={`${
                totals.totalDueNow
                  ? `${totals.totalDueNow.currencySymbol}${totals.totalDueNow.amountFormatted}`
                  : `${totals.grandTotal.currencySymbol}${totals.grandTotal.amountFormatted}`
              }`}
            />
          </LineItems.Group>
        </LineItems.Root>
      </Box>

      {stripe && (
        <Elements
          stripe={stripe}
          options={{ clientSecret: checkout.externalClientSecret, appearance: elementsAppearance }}
        >
          <CheckoutFormElements
            checkout={checkout}
            onCheckoutComplete={onCheckoutComplete}
          />
        </Elements>
      )}
    </Drawer.Body>
  );
};

const CheckoutFormElements = ({
  checkout,
  onCheckoutComplete,
}: {
  checkout: __experimental_CommerceCheckoutResource;
  onCheckoutComplete: (checkout: __experimental_CommerceCheckoutResource) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { __experimental_commerce } = useClerk();
  const [openAccountFundsDropDown, setOpenAccountFundsDropDown] = useState(true);
  const [openAddNewSourceDropDown, setOpenAddNewSourceDropDown] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ClerkRuntimeError | ClerkAPIError | string | undefined>();

  const { data } = useFetch(__experimental_commerce?.getPaymentSources, {});
  const { data: paymentSources } = data || { data: [] };

  const didExpandStripePaymentMethods = useCallback(() => {
    setOpenAccountFundsDropDown(false);
  }, []);

  const confirmCheckout = async ({ paymentSourceId }: { paymentSourceId: string }) => {
    return checkout
      .confirm({ paymentSourceId })
      .then(newCheckout => {
        onCheckoutComplete(newCheckout);
      })
      .catch(error => {
        throw error;
      });
  };

  const onPaymentSourceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(undefined);

    const data = new FormData(e.currentTarget);
    const paymentSourceId = data.get('payment_source_id') as string;

    try {
      await confirmCheckout({ paymentSourceId });
    } catch (error) {
      handleError(error, [], setSubmitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onStripeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setIsSubmitting(true);
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
        return;
      }

      const paymentSource = await __experimental_commerce.addPaymentSource({
        gateway: 'stripe',
        paymentMethod: 'card',
        paymentToken: setupIntent.payment_method as string,
      });

      await confirmCheckout({ paymentSourceId: paymentSource.id });
    } catch (error) {
      console.log(error);
      handleError(error, [], setSubmitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Col
      elementDescriptor={descriptors.checkoutFormElementsRoot}
      gap={3}
      sx={t => ({ padding: t.space.$4 })}
    >
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
      {paymentSources.length > 0 && (
        <>
          <Disclosure.Root
            open={openAccountFundsDropDown}
            onOpenChange={setOpenAccountFundsDropDown}
          >
            {/* TODO(@Commerce): needs localization */}
            <Disclosure.Trigger text='Account Funds' />
            <Disclosure.Content>
              <Col gap={3}>
                <PaymentSourceMethods
                  paymentSources={paymentSources}
                  totalDueNow={checkout.totals.totalDueNow || checkout.totals.grandTotal}
                  onPaymentSourceSubmit={onPaymentSourceSubmit}
                  isSubmitting={isSubmitting}
                />
              </Col>
            </Disclosure.Content>
          </Disclosure.Root>
          <Divider />
        </>
      )}

      <Disclosure.Root
        open={openAddNewSourceDropDown}
        onOpenChange={setOpenAddNewSourceDropDown}
      >
        {/* TODO(@Commerce): needs localization */}
        <Disclosure.Trigger text='Add a New Payment Source' />
        <Disclosure.Content>
          <StripePaymentMethods
            totalDueNow={checkout.totals.totalDueNow || checkout.totals.grandTotal}
            onStripeSubmit={onStripeSubmit}
            onExpand={didExpandStripePaymentMethods}
            isSubmitting={isSubmitting}
          />
        </Disclosure.Content>
      </Disclosure.Root>
    </Col>
  );
};

const PaymentSourceMethods = ({
  totalDueNow,
  paymentSources,
  onPaymentSourceSubmit,
  isSubmitting,
}: {
  totalDueNow: __experimental_CommerceMoney;
  paymentSources: __experimental_CommercePaymentSourceResource[];
  onPaymentSourceSubmit: React.FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
}) => {
  const [selectedPaymentSource, setSelectedPaymentSource] = useState<
    __experimental_CommercePaymentSourceResource | undefined
  >(paymentSources.length > 0 ? paymentSources[0] : undefined);

  const options = useMemo(() => {
    return paymentSources.map(source => {
      return {
        value: source.id,
        label: `${source.cardType} ⋯ ${source.last4}`,
      };
    });
  }, [paymentSources]);

  return (
    <Form
      onSubmit={onPaymentSourceSubmit}
      sx={t => ({
        display: 'flex',
        flexDirection: 'column',
        rowGap: t.space.$3,
      })}
    >
      <Select
        elementId='role'
        options={options}
        value={selectedPaymentSource?.id || null}
        onChange={option => {
          const paymentSource = paymentSources.find(source => source.id === option.value);
          setSelectedPaymentSource(paymentSource);
        }}
        portal
      >
        {/*Store value inside an input in order to be accessible as form data*/}
        <input
          name='payment_source_id'
          type='hidden'
          value={selectedPaymentSource?.id}
        />
        <SelectButton
          icon={ArrowUpDown}
          sx={t => ({
            justifyContent: 'space-between',
            backgroundColor: t.colors.$colorBackground,
          })}
        >
          {selectedPaymentSource && (
            <Flex
              gap={3}
              align='center'
            >
              <Icon icon={CreditCard} />
              <Text
                as='span'
                colorScheme='body'
              >
                {selectedPaymentSource.cardType} ⋯ {selectedPaymentSource.last4}
              </Text>
            </Flex>
          )}
        </SelectButton>
        <SelectOptionList
          sx={t => ({
            paddingBlock: t.space.$1,
            color: t.colors.$colorText,
          })}
        />
      </Select>
      <Button
        type='submit'
        colorScheme='primary'
        size='sm'
        textVariant={'buttonLarge'}
        sx={{
          width: '100%',
        }}
        isLoading={isSubmitting}
      >
        {/* TODO(@COMMERCE): needs localization */}
        Pay {totalDueNow.currencySymbol}
        {totalDueNow.amountFormatted}
      </Button>
    </Form>
  );
};

const StripePaymentMethods = ({
  totalDueNow,
  onStripeSubmit,
  onExpand,
  isSubmitting,
}: {
  totalDueNow: __experimental_CommerceMoney;
  onStripeSubmit: React.FormEventHandler<HTMLFormElement>;
  onExpand: () => void;
  isSubmitting: boolean;
}) => {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (!collapsed) {
      onExpand();
    }
  }, [collapsed, onExpand]);

  return (
    <Form
      onSubmit={onStripeSubmit}
      sx={t => ({
        display: 'flex',
        flexDirection: 'column',
        rowGap: t.space.$3,
      })}
    >
      <Button
        elementId={descriptors.button.setId('paypal')}
        variant='unstyled'
        size='md'
        textVariant={'buttonLarge'}
        block
        sx={{
          backgroundColor: '#FFC43A',
          color: '#222D65',
        }}
      >
        {/* TODO(@COMMERCE): needs localization */}
        Pay with PayPal
      </Button>
      {collapsed ? (
        <>
          <Button
            elementId={descriptors.button.setId('applePay')}
            variant='unstyled'
            size='md'
            textVariant={'buttonLarge'}
            sx={{
              width: '100%',
              backgroundColor: 'black',
              color: 'white',
            }}
          >
            {/* TODO(@COMMERCE): needs localization */}
            Pay with ApplePay
          </Button>
          <Button
            elementId={descriptors.button.setId('gPay')}
            variant='unstyled'
            size='md'
            textVariant={'buttonLarge'}
            block
            sx={{
              backgroundColor: 'black',
              color: 'white',
            }}
          >
            {/* TODO(@COMMERCE): needs localization */}
            Pay with GPay
          </Button>
          <Button
            colorScheme='secondary'
            variant='bordered'
            size='md'
            textVariant={'buttonLarge'}
            block
            onClick={() => setCollapsed(false)}
          >
            {/* TODO(@COMMERCE): needs localization */}
            More Payment Methods
          </Button>
        </>
      ) : (
        <>
          <PaymentElement />
          <Button
            type='submit'
            colorScheme='primary'
            size='sm'
            textVariant={'buttonLarge'}
            block
            isLoading={isSubmitting}
          >
            {/* TODO(@COMMERCE): needs localization */}
            Pay {totalDueNow.currencySymbol}
            {totalDueNow.amountFormatted}
          </Button>
        </>
      )}
    </Form>
  );
};
