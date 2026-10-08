import { SegmentedControl } from '@/ui/elements/SegmentedControl';

import { Col, descriptors, localizationKeys } from '../../customizables';
import type { PaymentMethodSource } from './checkout-form-elements-internal.controller';

export const CheckoutFormElementsInternalView = ({
  hasPlan,
  hasPaymentMethods,
  needsPaymentMethod,
  showTabs,
  paymentMethodSource,
  onPaymentMethodSourceChange,
  freeTrialButton,
  existingPaymentMethodForm,
  addPaymentMethodForm,
}: {
  hasPlan: boolean;
  hasPaymentMethods: boolean;
  needsPaymentMethod: boolean | null;
  showTabs: boolean | null;
  paymentMethodSource: PaymentMethodSource;
  onPaymentMethodSourceChange: (value: PaymentMethodSource) => void;
  freeTrialButton: React.ReactNode;
  existingPaymentMethodForm: React.ReactNode;
  addPaymentMethodForm: React.ReactNode;
}) => {
  if (!hasPlan) {
    return null;
  }

  return (
    <Col
      elementDescriptor={descriptors.checkoutFormElementsRoot}
      gap={4}
      sx={t => ({ padding: t.space.$4 })}
    >
      {__BUILD_DISABLE_RHC__ ? null : (
        <>
          {hasPaymentMethods && showTabs && (
            <SegmentedControl.Root
              aria-label='Payment method source'
              value={paymentMethodSource}
              onChange={value => onPaymentMethodSourceChange(value as PaymentMethodSource)}
              size='lg'
              fullWidth
            >
              <SegmentedControl.Button
                value='existing'
                text={localizationKeys('billing.paymentMethods__label')}
              />
              <SegmentedControl.Button
                value='new'
                text={localizationKeys('billing.addPaymentMethod__label')}
              />
            </SegmentedControl.Root>
          )}
        </>
      )}

      {!needsPaymentMethod
        ? freeTrialButton
        : paymentMethodSource === 'existing'
          ? existingPaymentMethodForm
          : !__BUILD_DISABLE_RHC__ && paymentMethodSource === 'new' && addPaymentMethodForm}
    </Col>
  );
};
