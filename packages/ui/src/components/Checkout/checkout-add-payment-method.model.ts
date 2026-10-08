import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';

import { projectPaymentElementCheckout } from '../PaymentMethods/add-payment-method.model';
import { useCheckoutMutationsModel } from './checkout-mutations.model';
import type { AddPaymentMethodForCheckoutModel } from './checkout-mutations.types';
import { useCheckoutSubmitLabelModel } from './checkout-submit-label.model';

export const useAddPaymentMethodForCheckoutModel = (): AddPaymentMethodForCheckoutModel => {
  const mutations = useCheckoutMutationsModel();
  const submitLabel = useCheckoutSubmitLabelModel();
  const { checkout } = useCheckout();
  return {
    mutations,
    submitLabel,
    requestKey: checkout.externalClientSecret ?? undefined,
    checkout: projectPaymentElementCheckout(checkout),
  };
};
