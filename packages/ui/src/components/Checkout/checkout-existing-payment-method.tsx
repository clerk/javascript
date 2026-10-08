import { withCardStateProvider } from '@/ui/elements/contexts';

import { useExistingPaymentMethodFormController } from './checkout-existing-payment-method.controller';
import { useExistingPaymentMethodFormModel } from './checkout-existing-payment-method.model';
import { ExistingPaymentMethodFormView } from './checkout-existing-payment-method.view';
export const ExistingPaymentMethodForm = withCardStateProvider(() => {
  const model = useExistingPaymentMethodFormModel();
  const controller = useExistingPaymentMethodFormController(model);
  return (
    <ExistingPaymentMethodFormView
      showPaymentMethods={model.showPaymentMethods}
      controller={controller}
    />
  );
});
