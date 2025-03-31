import { useClerk } from '@clerk/shared/react';
import type {
  __experimental_CommerceCheckoutResource,
  __experimental_CommerceMoney,
  __experimental_CommercePaymentSourceResource,
  ClerkAPIError,
  ClerkRuntimeError,
} from '@clerk/types';
import { useCallback, useMemo, useState } from 'react';

import { Box, Button, Col, descriptors, Flex, Form, Icon, Text } from '../../customizables';
import { Alert, Disclosure, Divider, Drawer, LineItems, Select, SelectButton, SelectOptionList } from '../../elements';
import { useFetch } from '../../hooks';
import { ArrowUpDown, CreditCard } from '../../icons';
import { animations } from '../../styledSystem';
import { handleError } from '../../utils';
import { AddPaymentSource } from '../PaymentSources';

export const CheckoutForm = ({
  checkout,
  onCheckoutComplete,
}: {
  checkout: __experimental_CommerceCheckoutResource;
  onCheckoutComplete: (checkout: __experimental_CommerceCheckoutResource) => void;
}) => {
  const { plan, planPeriod, totals } = checkout;

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

      <CheckoutFormElements
        checkout={checkout}
        onCheckoutComplete={onCheckoutComplete}
      />
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
  const { __experimental_commerce } = useClerk();
  const [openAccountFundsDropDown, setOpenAccountFundsDropDown] = useState(true);
  const [openAddNewSourceDropDown, setOpenAddNewSourceDropDown] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ClerkRuntimeError | ClerkAPIError | string | undefined>();

  const { data } = useFetch(__experimental_commerce?.getPaymentSources, 'commerce-payment-sources');
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

  const onAddPaymentSourceSuccess = async (paymentSource: __experimental_CommercePaymentSourceResource) => {
    await confirmCheckout({ paymentSourceId: paymentSource.id });
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
          <AddPaymentSource
            checkout={checkout}
            onSuccess={onAddPaymentSourceSuccess}
            onExpand={didExpandStripePaymentMethods}
            submitButtonText={`Pay ${(checkout.totals.totalDueNow || checkout.totals.grandTotal).currencySymbol}${(checkout.totals.totalDueNow || checkout.totals.grandTotal).amountFormatted}`}
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
