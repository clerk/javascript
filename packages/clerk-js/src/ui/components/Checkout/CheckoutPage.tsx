import type { __internal_CheckoutProps, ClerkAPIError, CommerceCheckoutResource } from '@clerk/types';

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
import { usePrefersReducedMotion } from '../../hooks';
import { EmailForm } from '../UserProfile/EmailForm';
import { CheckoutComplete } from './CheckoutComplete';
import { CheckoutForm } from './CheckoutForm';
import { useCheckout } from './useCheckout';

export const CheckoutPage = (props: __internal_CheckoutProps) => {
  const { translateError } = useLocalizations();
  const { t } = useLocalizations();
  const { planId, planPeriod, subscriberType, onSubscriptionComplete } = props;
  const { setIsOpen } = useDrawerContext();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedLayout;
  const isMotionSafe = !prefersReducedMotion && layoutAnimations === true;
  const { data: plans, isLoading: plansLoading } = usePlans();

  const { checkout, isLoading, updateCheckout, errors, startCheckout } = useCheckout({
    planId,
    planPeriod,
    subscriberType,
  });

  const isMissingPayerEmail = !!errors?.some((e: ClerkAPIError) => e.code === 'missing_payer_email');

  const plan = plans?.find(p => p.id === planId);

  const onCheckoutComplete = (newCheckout: CommerceCheckoutResource) => {
    void updateCheckout(newCheckout);
    onSubscriptionComplete?.();
  };

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
            onSuccess={startCheckout}
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
            <Alert
              variant='info'
              colorScheme='info'
              title={localizationKeys('commerce.cannotSubscribeMonthly')}
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
          {errors ? translateError(errors[0]) : t(localizationKeys('unstable__errors.form_param_value_invalid'))}
        </Alert>
      </Flex>
    </Drawer.Body>
  );
};
