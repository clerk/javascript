import type {
  __experimental_CheckoutProps,
  __experimental_CommercePlanResource,
  __experimental_CommerceTotals,
} from '@clerk/types';
import { Elements } from '@stripe/react-stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useRef, useState } from 'react';

import { useEnvironment } from '../../contexts';
import { Alert, Box, Spinner } from '../../customizables';
import { LineItems } from '../../elements';
import { useCheckout } from '../../hooks';
import { CheckoutComplete } from './CheckoutComplete';
import { CheckoutForm } from './CheckoutForm';

export const CheckoutPage = (props: __experimental_CheckoutProps) => {
  const { planId, planPeriod } = props;
  const stripePromiseRef = useRef<Promise<Stripe | null> | null>(null);
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const { __experimental_commerceSettings } = useEnvironment();

  const { checkout, updateCheckout, isLoading } = useCheckout({
    planId,
    planPeriod,
  });

  useEffect(() => {
    if (
      !stripePromiseRef.current &&
      checkout?.externalGatewayId &&
      __experimental_commerceSettings.stripePublishableKey
    ) {
      stripePromiseRef.current = loadStripe(__experimental_commerceSettings.stripePublishableKey, {
        stripeAccount: checkout.externalGatewayId,
      });
      void stripePromiseRef.current.then(stripeInstance => {
        setStripe(stripeInstance);
      });
    }
  }, [checkout?.externalGatewayId, __experimental_commerceSettings]);

  if (isLoading) {
    return (
      <Spinner
        sx={{
          margin: 'auto',
        }}
      />
    );
  }

  if (!checkout) {
    return (
      <>
        {/* TODO(@COMMERCE): needs localization */}
        <Alert
          colorScheme='danger'
          sx={{
            margin: 'auto',
          }}
        >
          There was a problem, please try again later.
        </Alert>
      </>
    );
  }

  if (checkout?.status === 'completed') {
    return <CheckoutComplete checkout={checkout} />;
  }

  return (
    <>
      <Box
        sx={t => ({
          padding: t.space.$4,
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
      </Box>

      {stripe && (
        <Elements
          stripe={stripe}
          options={{ clientSecret: checkout.externalClientSecret }}
        >
          <CheckoutForm
            checkout={checkout}
            onCheckoutComplete={updateCheckout}
          />
        </Elements>
      )}
    </>
  );
};

// TODO(@COMMERCE): needs localization
const CheckoutPlanRows = ({
  plan,
  planPeriod,
  totals,
}: {
  plan: __experimental_CommercePlanResource;
  planPeriod: string;
  totals: __experimental_CommerceTotals;
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
