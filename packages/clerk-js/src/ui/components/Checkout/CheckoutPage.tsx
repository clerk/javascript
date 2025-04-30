import type { __internal_CheckoutProps, CommerceCheckoutResource } from '@clerk/types';

import { Alert, Box, localizationKeys, Spinner } from '../../customizables';
import { Drawer, useDrawerContext } from '../../elements';
import { useCheckout } from '../../hooks';
import { EmailForm } from '../UserProfile/EmailForm';
import { CheckoutComplete } from './CheckoutComplete';
import { CheckoutForm } from './CheckoutForm';

export const CheckoutPage = (props: __internal_CheckoutProps) => {
  const { planId, planPeriod, subscriberType, onSubscriptionComplete } = props;
  const { setIsOpen } = useDrawerContext();

  const { checkout, isLoading, invalidate, revalidate, updateCheckout, isMissingPayerEmail } = useCheckout({
    planId,
    planPeriod,
    subscriberType,
  });

  const onCheckoutComplete = (newCheckout: CommerceCheckoutResource) => {
    invalidate(); // invalidate the initial checkout on complete
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

  if (checkout) {
    if (checkout?.status === 'completed') {
      return <CheckoutComplete checkout={checkout} />;
    }

    return (
      <CheckoutForm
        checkout={checkout}
        onCheckoutComplete={onCheckoutComplete}
      />
    );
  }

  if (isMissingPayerEmail) {
    return (
      <Drawer.Body>
        <Box
          sx={t => ({
            padding: t.space.$4,
          })}
        >
          <EmailForm
            title={localizationKeys('__experimental_commerce.checkout.emailForm.title')}
            subtitle={localizationKeys('__experimental_commerce.checkout.emailForm.subtitle')}
            onSuccess={revalidate}
            onReset={() => setIsOpen(false)}
            disableAutoFocus
          />
        </Box>
      </Drawer.Body>
    );
  }

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
};
