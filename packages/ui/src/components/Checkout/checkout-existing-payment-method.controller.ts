import { useState } from 'react';

import { useCheckoutMutationsController } from './checkout-mutations.controller';
import type { ExistingPaymentMethodData, ExistingPaymentMethodModel } from './checkout-mutations.types';

export const useExistingPaymentMethodFormController = (
  model: ExistingPaymentMethodModel,
): ExistingPaymentMethodData => {
  const { confirmCheckout, error } = useCheckoutMutationsController(model.mutations);
  const [selection, setSelection] = useState({
    key: model.mutations.requestKey,
    id: model.initialSelectedPaymentMethod?.id,
  });
  const selectedPaymentMethodId =
    selection.key === model.mutations.requestKey ? selection.id : model.initialSelectedPaymentMethod?.id;
  const selectedPaymentMethod =
    model.paymentMethods.find(method => method.id === selectedPaymentMethodId) ??
    (model.initialSelectedPaymentMethod?.id === selectedPaymentMethodId
      ? model.initialSelectedPaymentMethod
      : undefined);

  return {
    payWithExistingPaymentMethod: event => {
      event.preventDefault();
      if (model.showPaymentMethods && !selectedPaymentMethod) {
        return Promise.resolve();
      }
      return confirmCheckout(selectedPaymentMethod ? { paymentMethodId: selectedPaymentMethod.id } : {});
    },
    error,
    selectedPaymentMethodId: selectedPaymentMethod?.id,
    selectedPaymentMethodPreview: selectedPaymentMethod?.preview,
    options: model.options,
    selectPaymentMethod: (id: string) => {
      if (model.mutations.canRun()) {
        setSelection({
          key: model.mutations.requestKey,
          id: model.paymentMethods.find(method => method.id === id)?.id,
        });
      }
    },
  };
};
