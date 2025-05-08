import type { __internal_CheckoutProps, ClerkAPIError, CommerceCheckoutResource } from '@clerk/types';
import { useEffect } from 'react';

import { usePlans } from '../../contexts';
import {
  Box,
  descriptors,
  Flex,
  localizationKeys,
  Spinner,
  useAppearance,
  useLocalizations,
} from '../../customizables';
import { Alert, Drawer, LineItems, useDrawerContext } from '../../elements';
import { useCheckout, usePrefersReducedMotion } from '../../hooks';
import { EmailForm } from '../UserProfile/EmailForm';
import { CheckoutComplete } from './CheckoutComplete';
import { CheckoutForm } from './CheckoutForm';

export const CheckoutPage = (props: __internal_CheckoutProps) => {
  const { translateError } = useLocalizations();
  const { planId, planPeriod, subscriberType, onSubscriptionComplete } = props;
  const { setIsOpen, isOpen } = useDrawerContext();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedLayout;
  const isMotionSafe = !prefersReducedMotion && layoutAnimations === true;
  const { data: plans, isLoading: plansLoading } = usePlans();

  const { checkout, isLoading, invalidate, revalidate, updateCheckout, errors } = useCheckout({
    planId,
    planPeriod,
    subscriberType,
  });

  const isMissingPayerEmail = !!errors?.some((e: ClerkAPIError) => e.code === 'missing_payer_email');

  const plan = plans?.find(p => p.id === planId);

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

  if (isLoading || plansLoading) {
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

  const error = errors?.[0];
  if (error?.code === 'invalid_plan_change' && plan) {
    return (
      <Drawer.Body>
        <Flex
          gap={4}
          direction='col'
        >
          <Box
            elementDescriptor={descriptors.checkoutFormLineItemsRoot}
            sx={t => ({
              padding: t.space.$4,
              borderBottomWidth: t.borderWidths.$normal,
              borderBottomStyle: t.borderStyles.$solid,
              borderBottomColor: t.colors.$neutralAlpha100,
            })}
          >
            <LineItems.Root>
              <LineItems.Group>
                <LineItems.Title
                  title={plan.name}
                  description={planPeriod === 'annual' ? localizationKeys('commerce.billedAnnually') : undefined}
                />
                <LineItems.Description
                  prefix={planPeriod === 'annual' ? 'x12' : undefined}
                  text={`${plan.currencySymbol}${planPeriod === 'month' ? plan.amountFormatted : plan.annualMonthlyAmountFormatted}`}
                  suffix={localizationKeys('commerce.checkout.perMonth')}
                />
              </LineItems.Group>
            </LineItems.Root>
          </Box>
          <Box sx={t => ({ padding: t.space.$4 })}>
            {/* TODO(@Commerce): needs localization */}
            <Alert
              variant='info'
              colorScheme='info'
              title={`You cannot subscribe to this plan by paying monthly. To subscribe to this plan, you need to choose to pay annually.`}
            />
          </Box>
        </Flex>
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
        <Alert
          variant='danger'
          colorScheme='danger'
        >
          {errors ? translateError(errors[0]) : 'There was a problem, please try again later.'}
        </Alert>
      </Flex>
    </Drawer.Body>
  );
};
