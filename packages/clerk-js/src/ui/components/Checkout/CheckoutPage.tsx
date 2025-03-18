import type { __experimental_CheckoutProps } from '@clerk/types';
import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useRef, useState } from 'react';

import { useEnvironment } from '../../contexts';
import { Alert, Spinner } from '../../customizables';
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
    <CheckoutForm
      stripe={stripe}
      checkout={checkout}
      onCheckoutComplete={updateCheckout}
    />
  );
};
