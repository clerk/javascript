import type { __experimental_CheckoutProps, __experimental_CommerceCheckoutResource } from '@clerk/types';
import { useEffect } from 'react';

import { Alert, Box, localizationKeys, Spinner } from '../../customizables';
import { Drawer, useDrawerContext } from '../../elements';
import { useCheckout } from '../../hooks';
import { EmailForm } from '../UserProfile/EmailForm';
import { CheckoutComplete } from './CheckoutComplete';
import { CheckoutForm } from './CheckoutForm';

export const CheckoutPage = (props: __experimental_CheckoutProps) => {
  const { planId, planPeriod, subscriberType, onSubscriptionComplete, checkoutContinueUrl } = props;
  const { setIsOpen, isOpen } = useDrawerContext();

  const { checkout, isLoading, invalidate, revalidate, updateCheckout, isMissingPayerEmail } = useCheckout({
    planId,
    planPeriod,
    subscriberType,
  });

  const onCheckoutComplete = (newCheckout: __experimental_CommerceCheckoutResource) => {
    invalidate(); // invalidate the initial checkout on complete
    updateCheckout(newCheckout);
    onSubscriptionComplete?.();
  };

  useEffect(() => {
    if (isOpen) {
      revalidate();
    }
  }, [isOpen]);

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
      return (
        <CheckoutComplete
          checkout={checkout}
          checkoutContinueUrl={checkoutContinueUrl}
        />
      );
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
