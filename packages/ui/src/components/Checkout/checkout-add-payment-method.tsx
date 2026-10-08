import { withCardStateProvider } from '@/ui/elements/contexts';

import * as AddPaymentMethod from '../PaymentMethods/AddPaymentMethod';
import { useAddPaymentMethodForCheckoutModel } from './checkout-add-payment-method.model';
import { AddPaymentMethodForCheckoutView } from './checkout-add-payment-method.view';

export const AddPaymentMethodForCheckout = withCardStateProvider(() => {
  const model = useAddPaymentMethodForCheckoutModel();

  return (
    <AddPaymentMethod.Root
      onSuccess={model.mutations.confirmCheckout}
      requestKey={model.requestKey}
      checkout={model.checkout}
    >
      <AddPaymentMethodForCheckoutView submitLabel={model.submitLabel} />
    </AddPaymentMethod.Root>
  );
});
