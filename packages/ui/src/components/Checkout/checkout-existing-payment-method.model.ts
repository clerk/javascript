import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';

import { usePaymentMethods } from '../../contexts';
import { useCheckoutMutationsModel } from './checkout-mutations.model';
import type { ExistingPaymentMethodModel } from './checkout-mutations.types';
import { projectCheckoutPaymentMethod } from './checkout-payment-method.layout';

export const useExistingPaymentMethodFormModel = (): ExistingPaymentMethodModel => {
  const { checkout } = useCheckout();
  const { paymentMethod, isImmediatePlanChange, needsPaymentMethod } = checkout;
  const { data: paymentMethods } = usePaymentMethods();
  const mutations = useCheckoutMutationsModel();
  const defaultPaymentMethod = paymentMethods.find(method => method.isDefault);
  const initialSelectedPaymentMethod = paymentMethod || defaultPaymentMethod;
  const projectedPaymentMethods = paymentMethods.map(projectCheckoutPaymentMethod);
  const options = projectedPaymentMethods.map(method => ({ value: method.id, label: method.label }));

  return {
    options,
    initialSelectedPaymentMethod: initialSelectedPaymentMethod
      ? projectCheckoutPaymentMethod(initialSelectedPaymentMethod)
      : undefined,
    paymentMethods: projectedPaymentMethods,
    showPaymentMethods: isImmediatePlanChange && needsPaymentMethod,
    mutations,
  };
};
