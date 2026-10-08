import { Card } from '@/ui/elements/Card';

import { Form } from '../../customizables';
import { checkoutFormProps } from './checkout-form-styles';
import { CheckoutSubmitButton } from './checkout-submit-button';

export const CheckoutFreeTrialView = ({
  onConfirm,
  error,
}: {
  onConfirm: () => Promise<void>;
  error: React.ReactNode;
}) => (
  <Form
    onSubmit={event => {
      event.preventDefault();
      void onConfirm();
    }}
    sx={checkoutFormProps}
  >
    <Card.Alert>{error}</Card.Alert>
    <CheckoutSubmitButton />
  </Form>
);
