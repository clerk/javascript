import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';

import { Alert } from '@/ui/elements/Alert';
import { Drawer, useDrawerContext } from '@/ui/elements/Drawer';
import { LineItems } from '@/ui/elements/LineItems';

import { useCheckoutContext } from '../../contexts';
import { Box, descriptors, Flex, localizationKeys, useLocalizations } from '../../customizables';
import { EmailForm } from '../UserProfile/EmailForm';

export const GenericError = () => {
  const { errors } = useCheckout();

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
          {errors.global
            ? translateError(errors.global[0])
            : t(localizationKeys('unstable__errors.form_param_value_invalid'))}
        </Alert>
      </Flex>
    </Drawer.Body>
  );
};

export const InvalidPlanScreen = () => {
  const { planPeriod } = useCheckoutContext();
  const { errors } = useCheckout();

  const InvalidPlanError = errors?.global
    ?.filter(e => e.isClerkApiResponseError())
    .flatMap(e => e.errors)
    .find(e => e.code === 'invalid_plan_change');

  if (!InvalidPlanError) {
    return null;
  }

  const { plan: planFromError, isPlanUpgradePossible } = InvalidPlanError?.meta || {};

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
                description={planPeriod === 'annual' ? localizationKeys('billing.billedAnnually') : undefined}
              />
              <LineItems.Description
                prefix={planPeriod === 'annual' ? 'x12' : undefined}
                text={`${planFromError.currency_symbol}${planPeriod === 'month' ? planFromError.amount_formatted : planFromError.annual_monthly_amount_formatted}`}
                suffix={localizationKeys('billing.checkout.perMonth')}
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
                ? localizationKeys('billing.cannotSubscribeMonthly')
                : localizationKeys('billing.cannotSubscribeUnrecoverable')
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
          title={localizationKeys('billing.checkout.emailForm.title')}
          subtitle={localizationKeys('billing.checkout.emailForm.subtitle')}
          onSuccess={() => void checkout.start()}
          onReset={() => setIsOpen(false)}
          disableAutoFocus
        />
      </Box>
    </Drawer.Body>
  );
};
