import type {
  __experimental_CheckoutProps,
  __experimental_CommerceCheckoutResource,
  ClerkAPIError,
} from '@clerk/types';
import { useEffect } from 'react';

import { Alert, Box, localizationKeys, Spinner, useLocalizations } from '../../customizables';
import { Drawer, useDrawerContext } from '../../elements';
import { useCheckout } from '../../hooks';
import { EmailForm } from '../UserProfile/EmailForm';
import { CheckoutComplete } from './CheckoutComplete';
import { CheckoutForm } from './CheckoutForm';

export const CheckoutPage = (props: __experimental_CheckoutProps) => {
  const { translateError } = useLocalizations();
  const { planId, planPeriod, subscriberType, onSubscriptionComplete } = props;
  const { setIsOpen, isOpen } = useDrawerContext();

  const { checkout, isLoading, invalidate, revalidate, updateCheckout, errors } = useCheckout({
    planId,
    planPeriod,
    subscriberType,
  });

  const isMissingPayerEmail = errors.some((e: ClerkAPIError) => e.code === 'missing_payer_email');

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
        {errors[0] ? translateError(errors[0]) : 'There was a problem, please try again later.'}
      </Alert>
    </>
  );
};
