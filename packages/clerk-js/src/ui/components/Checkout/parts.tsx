import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';
import { useMemo } from 'react';

import { Alert } from '@/ui/elements/Alert';
import { Drawer, useDrawerContext } from '@/ui/elements/Drawer';
import { LineItems } from '@/ui/elements/LineItems';

import { useCheckoutContext } from '../../contexts';
import { Box, descriptors, Flex, localizationKeys, useLocalizations } from '../../customizables';
// TODO(@COMMERCE): Is this causing bundle size  issues ?
import { EmailForm } from '../UserProfile/EmailForm';

export const GenericError = () => {
  const { planId, planPeriod, subscriberType } = useCheckoutContext();
  const { error } = useCheckout({
    for: subscriberType === 'org' ? 'organization' : undefined,
    planId: planId!,
    planPeriod: planPeriod!,
  });

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
          {error ? translateError(error.errors[0]) : t(localizationKeys('unstable__errors.form_param_value_invalid'))}
        </Alert>
      </Flex>
    </Drawer.Body>
  );
};

export const InvalidPlanScreen = () => {
  const { planId, planPeriod, subscriberType } = useCheckoutContext();
  const { error } = useCheckout({
    for: subscriberType === 'org' ? 'organization' : undefined,
    planId: planId!,
    planPeriod: planPeriod!,
  });

  const planFromError = useMemo(() => {
    const _error = error?.errors.find(e => e.code === 'invalid_plan_change');
    return _error?.meta?.plan;
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
            borderBottomColor: t.colors.$neutralAlpha100,
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
            title={localizationKeys('commerce.cannotSubscribeMonthly')}
          />
        </Box>
      </Flex>
    </Drawer.Body>
  );
};

export const AddEmailForm = () => {
  const { planId, planPeriod, subscriberType } = useCheckoutContext();
  const { start } = useCheckout({
    for: subscriberType === 'org' ? 'organization' : undefined,
    planId: planId!,
    planPeriod: planPeriod!,
  });
  const { setIsOpen } = useDrawerContext();
  return (
    <Drawer.Body>
      <Box
        sx={t => ({
          padding: t.space.$4,
        })}
      >
        {/* TODO(@COMMERCE): How does ths operate for orgs ? */}
        <EmailForm
          title={localizationKeys('commerce.checkout.emailForm.title')}
          subtitle={localizationKeys('commerce.checkout.emailForm.subtitle')}
          onSuccess={() => start().catch(() => null)}
          onReset={() => setIsOpen(false)}
          disableAutoFocus
        />
      </Box>
    </Drawer.Body>
  );
};
