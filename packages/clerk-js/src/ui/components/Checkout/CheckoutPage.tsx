import type { __experimental_CheckoutProps, CommercePlanResource, CommerceTotals } from '@clerk/types';
import { Elements } from '@stripe/react-stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';

import { useCheckoutContext, useEnvironment } from '../../contexts';
import { Alert, Box, Button, Col, Flex, Heading, Icon, Spinner } from '../../customizables';
import { LineItems } from '../../elements';
import { useCheckout } from '../../hooks';
import { Close } from '../../icons';
import { CheckoutComplete } from './CheckoutComplete';
import { CheckoutForm } from './CheckoutForm';

export const CheckoutPage = (props: __experimental_CheckoutProps) => {
  const { planId, planPeriod } = props;
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const { commerceSettings } = useEnvironment();

  const { checkout, setCheckout, isLoading } = useCheckout({
    planId,
    planPeriod,
  });

  useEffect(() => {
    if (checkout?.externalGatewayId && commerceSettings.stripePublishableKey) {
      setStripePromise(
        loadStripe(commerceSettings.stripePublishableKey, {
          stripeAccount: checkout.externalGatewayId,
        }),
      );
    }
  }, [checkout?.externalGatewayId, commerceSettings]);

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
              totals={checkout.totals}
            />
          </Col>

          {stripePromise && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: checkout.externalClientSecret }}
            >
              <CheckoutForm
                checkout={checkout}
                setCheckout={setCheckout}
              />
            </Elements>
          )}
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

const CheckoutPlanRows = ({
  plan,
  planPeriod,
  totals,
}: {
  plan: CommercePlanResource;
  planPeriod: string;
  totals: CommerceTotals;
}) => {
  return (
    <LineItems.Root>
      <LineItems.Group>
        <LineItems.Title>{plan.name}</LineItems.Title>
        <LineItems.Description suffix={`per month${planPeriod === 'annual' ? ', times 12 months' : ''}`}>
          {plan.currencySymbol}
          {planPeriod === 'month' ? plan.amountFormatted : plan.annualMonthlyAmountFormatted}
        </LineItems.Description>
      </LineItems.Group>
      <LineItems.Group
        borderTop
        variant='tertiary'
      >
        <LineItems.Title>Subtotal</LineItems.Title>
        <LineItems.Description>
          {totals.subtotal.currencySymbol}
          {totals.subtotal.amountFormatted}
        </LineItems.Description>
      </LineItems.Group>
      <LineItems.Group variant='tertiary'>
        <LineItems.Title>Tax</LineItems.Title>
        <LineItems.Description>
          {totals.taxTotal.currencySymbol}
          {totals.taxTotal.amountFormatted}
        </LineItems.Description>
      </LineItems.Group>
      <LineItems.Group borderTop>
        <LineItems.Title>Total{totals.totalDueNow ? ' Due Today' : ''}</LineItems.Title>
        <LineItems.Description>
          {totals.totalDueNow
            ? `${totals.totalDueNow.currencySymbol}${totals.totalDueNow.amountFormatted}`
            : `${totals.grandTotal.currencySymbol}${totals.grandTotal.amountFormatted}`}
        </LineItems.Description>
      </LineItems.Group>
    </LineItems.Root>
  );
};
