import type { PropsWithChildren } from 'react';

import { useAddPaymentMethodFormController } from './add-payment-method.controller';
import { AddPaymentMethodElement, useAddPaymentMethodFormModel } from './add-payment-method.model';
import { AddPaymentMethodFormView } from './add-payment-method.view';
import { PaymentElementSkeleton } from './PaymentElementSkeleton';

export const AddPaymentMethodForm = ({ children }: PropsWithChildren) => {
  const model = useAddPaymentMethodFormModel();
  const controller = useAddPaymentMethodFormController(model);
  return (
    <AddPaymentMethodFormView
      controller={controller}
      paymentElement={<AddPaymentMethodElement fallback={<PaymentElementSkeleton />} />}
    >
      {children}
    </AddPaymentMethodFormView>
  );
};
