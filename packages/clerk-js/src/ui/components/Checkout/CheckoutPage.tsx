import type {
  __experimental_CheckoutProps,
  __experimental_CommerceCheckoutResource,
  ClerkAPIError,
} from '@clerk/types';
import { useEffect } from 'react';

import { Alert, Box, Flex, localizationKeys, Spinner, useLocalizations } from '../../customizables';
import { Drawer, useDrawerContext } from '../../elements';
import { useCheckout } from '../../hooks';
import { EmailForm } from '../UserProfile/EmailForm';
import { CheckoutComplete } from './CheckoutComplete';
import { CheckoutForm } from './CheckoutForm';

export const CheckoutPage = (props: __experimental_CheckoutProps) => {
  const { translateError } = useLocalizations();
  const { planId, planPeriod, subscriberType, onSubscriptionComplete, checkoutContinueUrl } = props;
  const { setIsOpen, isOpen } = useDrawerContext();

  const { checkout, isLoading, invalidate, revalidate, updateCheckout, errors } = useCheckout({
    planId,
    planPeriod,
    subscriberType,
  });

  const isMissingPayerEmail = !!errors?.some((e: ClerkAPIError) => e.code === 'missing_payer_email');

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
    <Drawer.Body>
      <Flex
        align={'center'}
        justify={'center'}
        sx={t => ({
          height: '100%',
          padding: t.space.$4,
          fontSize: t.fontSizes.$md,
        })}
      >
        <Alert colorScheme='danger'>
          {errors ? translateError(errors[0]) : 'There was a problem, please try again later.'}
        </Alert>
      </Flex>
    </Drawer.Body>
  );
};
