import { useClerk } from '@clerk/shared/react';
import type { CommerceCheckoutResource, CommerceMoney, CommercePaymentSourceResource } from '@clerk/types';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Button, Col, Flex, Form, Icon, Text } from '../../customizables';
import { Select, SelectButton, SelectOptionList } from '../../elements';
import { useFetch } from '../../hooks';
import { ArrowUpDown, ChevronDown, CreditCard } from '../../icons';

export const CheckoutForm = ({
  checkout,
  onConfirm,
}: {
  checkout: CommerceCheckoutResource;
  onConfirm: (checkout: CommerceCheckoutResource) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { commerce } = useClerk();
  const [openAccountFundsDropDown, setOpenAccountFundsDropDown] = useState(true);
  const [openAddNewSourceDropDown, setOpenAddNewSourceDropDown] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data } = useFetch(commerce?.getPaymentSources, {});
  const { data: paymentSources } = data || { data: [] };

  const didExpandStripePaymentMethods = useCallback(() => {
    setOpenAccountFundsDropDown(false);
  }, []);

  const confirmCheckout = async ({ paymentSourceId }: { paymentSourceId: string }) => {
    return commerce.billing
      .confirmCheckout({
        checkoutId: checkout.id,
        paymentSourceId,
      })
      .then(res => {
        onConfirm(res);
        setIsSubmitting(false);
      })
      .catch(err => {
        console.log(err);
        setIsSubmitting(false);
      });
  };

  const onPaymentSourceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData(e.currentTarget);
    const paymentSourceId = data.get('payment_source_id') as string;

    return confirmCheckout({ paymentSourceId });
  };

  const onStripeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setIsSubmitting(true);

    const { setupIntent, error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: '', // TODO: need to figure this out
      },
      redirect: 'if_required',
    });
    if (error || !setupIntent) {
      return console.log(error.message || 'stripe error');
    }

    const { payment_method } = setupIntent;
    if (!payment_method) {
      return console.log('no payment method');
    }

    const paymentSource = await commerce.addPaymentSource({
      gateway: 'stripe',
      paymentMethod: 'card',
      paymentToken: payment_method as string,
    });
    if (!paymentSource) {
      return console.log('no payment source');
    }

    return confirmCheckout({ paymentSourceId: paymentSource.id });
  };

  return (
    <Col
      gap={3}
      sx={t => ({ padding: t.space.$4 })}
    >
      {paymentSources.length > 0 && (
        <>
          <Dropdown
            open={openAccountFundsDropDown}
            setOpen={setOpenAccountFundsDropDown}
            title='Account Funds'
          >
            <Col gap={3}>
              <PaymentSourceMethods
                paymentSources={paymentSources}
                totalDueNow={checkout.totals.totalDueNow || checkout.totals.grandTotal}
                onPaymentSourceSubmit={onPaymentSourceSubmit}
                isSubmitting={isSubmitting}
              />
            </Col>
          </Dropdown>
          <Text
            variant='buttonSmall'
            colorScheme='secondary'
            sx={{ textAlign: 'center' }}
          >
            OR
          </Text>
        </>
      )}

      <Dropdown
        open={openAddNewSourceDropDown}
        setOpen={setOpenAddNewSourceDropDown}
        title='Add a New Payment Source'
      >
        <StripePaymentMethods
          totalDueNow={checkout.totals.totalDueNow || checkout.totals.grandTotal}
          onStripeSubmit={onStripeSubmit}
          onExpand={didExpandStripePaymentMethods}
          isSubmitting={isSubmitting}
        />
      </Dropdown>
    </Col>
  );
};

const PaymentSourceMethods = ({
  totalDueNow,
  paymentSources,
  onPaymentSourceSubmit,
  isSubmitting,
}: {
  totalDueNow: CommerceMoney;
  paymentSources: CommercePaymentSourceResource[];
  onPaymentSourceSubmit: React.FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
}) => {
  const [selectedPaymentSource, setSelectedPaymentSource] = useState<CommercePaymentSourceResource | undefined>(
    paymentSources.length > 0 ? paymentSources[0] : undefined,
  );

  const options = useMemo(() => {
    return paymentSources.map(source => {
      return {
        value: source.id,
        label: `${source.cardType} ⋯ ${source.last4}`,
      };
    });
  }, [paymentSources]);

  return (
    <Form onSubmit={onPaymentSourceSubmit}>
      <Col gap={3}>
        <Select
          elementId='role'
          options={options}
          value={selectedPaymentSource?.id || null}
          onChange={option => {
            const paymentSource = paymentSources.find(source => source.id === option.value);
            setSelectedPaymentSource(paymentSource);
          }}
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
                <Text colorScheme='body'>
                  {selectedPaymentSource.cardType} ⋯ {selectedPaymentSource.last4}
                </Text>
              </Flex>
            )}
          </SelectButton>
          <SelectOptionList />
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
          Pay {totalDueNow.currencySymbol}
          {totalDueNow.amountFormatted}
        </Button>
      </Col>
    </Form>
  );
};

const StripePaymentMethods = ({
  totalDueNow,
  onStripeSubmit,
  onExpand,
  isSubmitting,
}: {
  totalDueNow: CommerceMoney;
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
    <Form onSubmit={onStripeSubmit}>
      <Col gap={3}>
        <Button
          variant='unstyled'
          size='md'
          textVariant={'buttonLarge'}
          sx={{
            width: '100%',
            backgroundColor: '#FFC43A',
            color: '#222D65',
          }}
        >
          Pay with PayPal
        </Button>
        {collapsed ? (
          <>
            <Button
              variant='unstyled'
              size='md'
              textVariant={'buttonLarge'}
              sx={{
                width: '100%',
                backgroundColor: 'black',
                color: 'white',
              }}
            >
              Pay with ApplePay
            </Button>
            <Button
              variant='unstyled'
              size='md'
              textVariant={'buttonLarge'}
              sx={{
                width: '100%',
                backgroundColor: 'black',
                color: 'white',
              }}
            >
              Pay with GPay
            </Button>
            <Button
              colorScheme='light'
              size='md'
              textVariant={'buttonLarge'}
              sx={{
                width: '100%',
              }}
              onClick={() => setCollapsed(false)}
            >
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
              sx={{
                width: '100%',
              }}
              isLoading={isSubmitting}
            >
              Pay {totalDueNow.currencySymbol}
              {totalDueNow.amountFormatted}
            </Button>
          </>
        )}
      </Col>
    </Form>
  );
};

const Dropdown = ({
  open,
  setOpen,
  title,
  children,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Col
      sx={t => ({
        borderRadius: t.radii.$lg,
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$neutralAlpha100,
      })}
    >
      <button
        type='button'
        onClick={() => setOpen(!open)}
      >
        <Flex
          gap={2}
          align='center'
          justify='between'
          sx={t => ({
            paddingInline: t.space.$3,
            height: t.sizes.$10,
          })}
        >
          <Text variant='buttonSmall'>{title}</Text>
          <Icon
            icon={ChevronDown}
            colorScheme='neutral'
            size='md'
            sx={{ rotate: open ? '180deg' : '0', transformOrigin: '50%' }}
          />
        </Flex>
      </button>

      {open && (
        <Box
          sx={t => ({
            padding: t.space.$3,
            backgroundColor: t.colors.$neutralAlpha25,
            borderRadius: t.radii.$lg,
            borderTopWidth: t.borderWidths.$normal,
            borderStyle: t.borderStyles.$solid,
            borderColor: t.colors.$neutralAlpha100,
          })}
        >
          {children}
        </Box>
      )}
    </Col>
  );
};
