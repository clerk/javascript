import { Card } from '@/ui/elements/Card';
import { Select, SelectButton, SelectOptionList } from '@/ui/elements/Select';

import { Form } from '../../customizables';
import { ChevronUpDown } from '../../icons';
import { PaymentMethodRowView } from '../PaymentMethods/PaymentMethodRow';
import { checkoutFormProps } from './checkout-form-styles';
import { HIDDEN_INPUT_NAME } from './checkout-mutations.controller';
import type { ExistingPaymentMethodData } from './checkout-mutations.types';
import { CheckoutSubmitButton } from './checkout-submit-button';

export const ExistingPaymentMethodFormView = ({
  showPaymentMethods,
  controller,
}: {
  showPaymentMethods: boolean | null;
  controller: ExistingPaymentMethodData;
}) => (
  <Form
    onSubmit={event => void controller.payWithExistingPaymentMethod(event)}
    sx={checkoutFormProps}
  >
    {showPaymentMethods ? (
      <Select
        elementId='paymentMethod'
        options={controller.options}
        value={controller.selectedPaymentMethodId || null}
        onChange={option => controller.selectPaymentMethod(option.value)}
        portal
      >
        {/*Store value inside an input in order to be accessible as form data*/}
        <input
          name={HIDDEN_INPUT_NAME}
          type='hidden'
          value={controller.selectedPaymentMethodId}
        />
        <SelectButton
          icon={ChevronUpDown}
          sx={t => ({
            justifyContent: 'space-between',
            backgroundColor: t.colors.$colorBackground,
          })}
        >
          {controller.selectedPaymentMethodPreview && (
            <PaymentMethodRowView paymentMethod={controller.selectedPaymentMethodPreview} />
          )}
        </SelectButton>
        <SelectOptionList
          sx={t => ({
            paddingBlock: t.space.$1,
            color: t.colors.$colorForeground,
          })}
        />
      </Select>
    ) : (
      <input
        name={HIDDEN_INPUT_NAME}
        type='hidden'
        value={controller.selectedPaymentMethodId}
      />
    )}
    <Card.Alert>{controller.error}</Card.Alert>
    <CheckoutSubmitButton />
  </Form>
);
