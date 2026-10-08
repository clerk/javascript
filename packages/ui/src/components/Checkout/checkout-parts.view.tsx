import { Alert } from '@/ui/elements/Alert';
import { Drawer } from '@/ui/elements/Drawer';
import { LineItems } from '@/ui/elements/LineItems';

import { Box, descriptors, Flex, localizationKeys } from '../../customizables';
import { EmailForm } from '../UserProfile/EmailForm';
import type { CheckoutGenericErrorData, CheckoutInvalidPlanData } from './checkout.types';
import type { useCheckoutAddEmailController } from './checkout-parts.controller';

export const CheckoutGenericErrorView = ({ message }: CheckoutGenericErrorData) => (
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
        {message}
      </Alert>
    </Flex>
  </Drawer.Body>
);

export const CheckoutInvalidPlanView = ({ model }: { model: CheckoutInvalidPlanData }) => {
  if (model.status === 'hidden') {
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
                title={model.planName}
                description={model.isAnnual ? localizationKeys('billing.billedAnnually') : undefined}
              />
              <LineItems.Description
                prefix={model.isAnnual ? 'x12' : undefined}
                text={`${model.currencySymbol}${model.isMonthly ? model.amountFormatted : model.annualMonthlyAmountFormatted}`}
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
              model.isPlanUpgradePossible
                ? localizationKeys('billing.cannotSubscribeMonthly')
                : localizationKeys('billing.cannotSubscribeUnrecoverable')
            }
          />
        </Box>
      </Flex>
    </Drawer.Body>
  );
};

export const CheckoutAddEmailView = ({
  controller,
}: {
  controller: ReturnType<typeof useCheckoutAddEmailController>;
}) => (
  <Drawer.Body>
    <Box
      sx={t => ({
        padding: t.space.$4,
      })}
    >
      <EmailForm
        title={localizationKeys('billing.checkout.emailForm.title')}
        subtitle={localizationKeys('billing.checkout.emailForm.subtitle')}
        onSuccess={controller.onSuccess}
        onReset={controller.onReset}
        disableAutoFocus
      />
    </Box>
  </Drawer.Body>
);
