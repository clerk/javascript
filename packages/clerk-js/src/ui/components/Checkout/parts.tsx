import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';
import { useMemo } from 'react';

import { Alert } from '@/ui/elements/Alert';
import { Drawer, useDrawerContext } from '@/ui/elements/Drawer';
import { LineItems } from '@/ui/elements/LineItems';

import { useCheckoutContext } from '../../contexts';
import { Box, descriptors, Flex, localizationKeys, useLocalizations } from '../../customizables';
import { EmailForm } from '../UserProfile/EmailForm';

export const GenericError = () => {
  const { checkout } = useCheckout();

  const { translateError } = useLocalizations();
  const { t } = useLocalizations();
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
          {checkout.error
            ? translateError(checkout.error.errors[0])
            : t(localizationKeys('unstable__errors.form_param_value_invalid'))}
        </Alert>
      </Flex>
    </Drawer.Body>
  );
};

export const InvalidPlanScreen = () => {
  const { planPeriod } = useCheckoutContext();
  const { checkout } = useCheckout();
  const error = checkout.error;

  const planFromError = useMemo(() => {
    const _error = error?.errors.find(e => e.code === 'invalid_plan_change');
    return _error?.meta?.plan;
  }, [error]);

  const isPlanUpgradePossible = useMemo(() => {
    const _error = error?.errors.find(e => e.code === 'invalid_plan_change');
    return _error?.meta?.isPlanUpgradePossible || false;
  }, [error]);

  if (!planFromError) {
    return null;
  }

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
            borderBottomColor: t.colors.$borderAlpha100,
          })}
        >
          <LineItems.Root>
            <LineItems.Group>
              <LineItems.Title
                title={planFromError.name}
                description={planPeriod === 'annual' ? localizationKeys('commerce.billedAnnually') : undefined}
              />
              <LineItems.Description
                prefix={planPeriod === 'annual' ? 'x12' : undefined}
                text={`${planFromError.currency_symbol}${planPeriod === 'month' ? planFromError.amount_formatted : planFromError.annual_monthly_amount_formatted}`}
                suffix={localizationKeys('commerce.checkout.perMonth')}
              />
            </LineItems.Group>
          </LineItems.Root>
        </Box>
        <Box sx={t => ({ padding: t.space.$4 })}>
          <Alert
            variant='info'
            colorScheme='info'
            title={
              isPlanUpgradePossible
                ? localizationKeys('commerce.cannotSubscribeMonthly')
                : localizationKeys('commerce.cannotSubscribeUnrecoverable')
            }
          />
        </Box>
      </Flex>
    </Drawer.Body>
  );
};

export const AddEmailForm = () => {
  const { checkout } = useCheckout();
  const { setIsOpen } = useDrawerContext();
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
          onSuccess={() => void checkout.start()}
          onReset={() => setIsOpen(false)}
          disableAutoFocus
        />
      </Box>
    </Drawer.Body>
  );
};
