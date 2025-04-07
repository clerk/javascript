import type { __experimental_CheckoutProps, __experimental_CommerceCheckoutResource } from '@clerk/types';

import { Alert, Spinner } from '../../customizables';
import { useCheckout } from '../../hooks';
import { CheckoutComplete } from './CheckoutComplete';
import { CheckoutForm } from './CheckoutForm';

export const CheckoutPage = (props: __experimental_CheckoutProps) => {
  const { planId, planPeriod, orgId, onSubscriptionComplete } = props;

  const { checkout, updateCheckout, isLoading } = useCheckout({
    planId,
    planPeriod,
    orgId,
  });

  const onCheckoutComplete = (newCheckout: __experimental_CommerceCheckoutResource) => {
    updateCheckout(newCheckout);
    onSubscriptionComplete?.();
  };

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
      checkout={checkout}
      onCheckoutComplete={onCheckoutComplete}
    />
  );
};
