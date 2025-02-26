import { useClerk } from '@clerk/shared/react';
import type { CheckoutProps, CommerceCheckoutResource, CommercePlanResource, CommerceTotals } from '@clerk/types';
import { Elements } from '@stripe/react-stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useRef, useState } from 'react';

import { useCheckoutContext } from '../../contexts';
import { Alert, Box, Button, Col, Flex, Heading, Icon, Spinner, Text } from '../../customizables';
import { useFetch } from '../../hooks';
import { Close } from '../../icons';
import { CheckoutComplete } from './CheckoutComplete';
import { CheckoutForm } from './CheckoutForm';

const COMMERCE_STRIPE_PUBLISHABLE_KEY = 'pk_test_AzTn97Yzl4y1OAnov07b5ihT00NNnE0sp7';

export const CheckoutPage = (props: CheckoutProps) => {
  const { planId, planPeriod } = props;
  const { commerce } = useClerk();
  const [checkout, setCheckout] = useState<CommerceCheckoutResource>();
  const stripePromise = useRef<Promise<Stripe | null> | null>(null);

  const { data, isLoading } = useFetch(commerce?.billing.startCheckout, { planId, planPeriod });

  useEffect(() => {
    if (data) {
      setCheckout(data);
      stripePromise.current = loadStripe(COMMERCE_STRIPE_PUBLISHABLE_KEY, { stripeAccount: data.externalGatewayId });
    }
  }, [data]);

  const onConfirm = (newCheckout: CommerceCheckoutResource) => {
    setCheckout(newCheckout);
  };

  return (
    <>
      <CheckoutHeader title='Checkout' />

      {isLoading ? (
        <Flex
          align='center'
          justify='center'
          sx={{ width: '100%', height: '100%' }}
        >
          <Spinner />
        </Flex>
      ) : !checkout ? (
        <Flex
          align='center'
          justify='center'
          sx={{ width: '100%', height: '100%' }}
        >
          <Alert colorScheme='danger'>There was a problem, please try again later.</Alert>
        </Flex>
      ) : checkout.status === 'completed' ? (
        <CheckoutComplete
          checkout={checkout}
          sx={t => ({ height: `calc(100% - ${t.space.$12})` })}
        />
      ) : (
        <Box
          sx={t => ({
            overflowY: 'auto',
            /* minus the height of the header */
            height: `calc(100% - ${t.space.$12})`,
            overflowX: 'hidden',
          })}
        >
          <Col
            gap={3}
            sx={t => ({
              padding: t.space.$4,
              backgroundColor: t.colors.$neutralAlpha25,
              borderBottomWidth: t.borderWidths.$normal,
              borderBottomStyle: t.borderStyles.$solid,
              borderBottomColor: t.colors.$neutralAlpha100,
            })}
          >
            <CheckoutPlanRows
              plan={checkout.plan}
              planPeriod={checkout.planPeriod}
            />
            <CheckoutTotalsRows totals={checkout.totals} />
          </Col>

          <Elements
            stripe={stripePromise.current}
            options={{ clientSecret: checkout.externalClientSecret }}
          >
            <CheckoutForm
              checkout={checkout}
              onConfirm={onConfirm}
            />
          </Elements>
        </Box>
      )}
    </>
  );
};

const CheckoutHeader = ({ title }: { title: string }) => {
  const { handleCloseBlade = () => {} } = useCheckoutContext();

  return (
    <Flex
      align='center'
      justify='between'
      gap={2}
      sx={t => ({
        position: 'sticky',
        top: 0,
        width: '100%',
        height: t.space.$12,
        paddingInline: `${t.space.$5} ${t.space.$2}`,
        borderBottomWidth: t.borderWidths.$normal,
        borderBottomStyle: t.borderStyles.$solid,
        borderBottomColor: t.colors.$neutralAlpha100,
      })}
    >
      <Heading textVariant='h2'>{title}</Heading>
      <Button
        variant='ghost'
        onClick={handleCloseBlade}
        sx={t => ({
          color: t.colors.$neutralAlpha400,
          padding: t.space.$2,
        })}
      >
        <Icon
          icon={Close}
          size='md'
        />
      </Button>
    </Flex>
  );
};

const CheckoutPlanRows = ({ plan, planPeriod }: { plan: CommercePlanResource; planPeriod: string }) => {
  return (
    <Col
      gap={3}
      align='stretch'
      sx={t => ({
        paddingBlockEnd: t.space.$3,
        borderBottomWidth: t.borderWidths.$normal,
        borderBottomStyle: t.borderStyles.$solid,
        borderBottomColor: t.colors.$neutralAlpha100,
      })}
    >
      <Flex
        align='baseline'
        justify='between'
        gap={2}
      >
        <Box>
          <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>{plan.name}</Text>
        </Box>
        <Col align='end'>
          <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>
            {plan.currencySymbol}
            {planPeriod === 'month' ? plan.amountFormatted : plan.annualMonthlyAmountFormatted}
          </Text>
          <Text
            colorScheme='secondary'
            variant='caption'
            sx={t => ({ lineHeight: t.lineHeights.$normal })}
          >
            per month{planPeriod === 'annual' ? ', times 12 months' : ''}
          </Text>
        </Col>
      </Flex>
    </Col>
  );
};

const CheckoutTotalsRows = ({ totals }: { totals: CommerceTotals }) => {
  return (
    <>
      <Col
        gap={3}
        align='stretch'
        sx={t => ({
          paddingBlockEnd: t.space.$3,
          borderBottomWidth: t.borderWidths.$normal,
          borderBottomStyle: t.borderStyles.$solid,
          borderBottomColor: t.colors.$neutralAlpha100,
          color: t.colors.$colorTextSecondary,
        })}
      >
        <Flex
          align='baseline'
          justify='between'
          gap={2}
        >
          <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>Subtotal</Text>
          <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>
            {totals.subtotal.currencySymbol}
            {totals.subtotal.amountFormatted}
          </Text>
        </Flex>
        <Flex
          align='baseline'
          justify='between'
          gap={2}
        >
          <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>Tax</Text>
          <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>
            {totals.taxTotal.currencySymbol}
            {totals.taxTotal.amountFormatted}
          </Text>
        </Flex>
      </Col>
      <Flex
        align='baseline'
        justify='between'
        gap={2}
      >
        <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>
          Total{totals.totalDueNow ? ' Due Today' : ''}
        </Text>
        <Text sx={t => ({ fontSize: '0.875rem', fontWeight: t.fontWeights.$medium })}>
          {totals.totalDueNow
            ? `${totals.totalDueNow.currencySymbol}${totals.totalDueNow.amountFormatted}`
            : `${totals.grandTotal.currencySymbol}${totals.grandTotal.amountFormatted}`}
        </Text>
      </Flex>
    </>
  );
};
