import type { ClerkAPIError, CommerceCheckoutResource } from '@clerk/types';
import { useEffect } from 'react';

import { Alert, Box, Flex, localizationKeys, Spinner, useAppearance, useLocalizations } from '../../customizables';
import { Drawer, useDrawerContext } from '../../elements';
import { useCheckout, usePrefersReducedMotion } from '../../hooks';
import { EmailForm } from '../UserProfile/EmailForm';
import { CheckoutComplete } from './CheckoutComplete';
import { CheckoutForm } from './CheckoutForm';

export const CheckoutPage = (props: CheckoutProps) => {
  const { translateError } = useLocalizations();
  const { planId, planPeriod, subscriberType, onSubscriptionComplete } = props;
  const { setIsOpen, isOpen } = useDrawerContext();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedLayout;
  const isMotionSafe = !prefersReducedMotion && layoutAnimations === true;

  const { checkout, isLoading, invalidate, revalidate, updateCheckout, errors } = useCheckout({
    planId,
    planPeriod,
    subscriberType,
  });

  const isMissingPayerEmail = !!errors?.some((e: ClerkAPIError) => e.code === 'missing_payer_email');

  const onCheckoutComplete = (newCheckout: CommerceCheckoutResource) => {
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
          isMotionSafe={isMotionSafe}
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
            title={localizationKeys('commerce.checkout.emailForm.title')}
            subtitle={localizationKeys('commerce.checkout.emailForm.subtitle')}
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
