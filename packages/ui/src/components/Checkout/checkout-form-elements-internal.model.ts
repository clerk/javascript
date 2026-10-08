import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';

import { usePaymentMethods } from '../../contexts';

export const useCheckoutFormElementsInternalModel = () => {
  const { checkout } = useCheckout();
  const { data: paymentMethods } = usePaymentMethods();
  const { plan, isImmediatePlanChange, needsPaymentMethod } = checkout;

  return {
    hasPlan: Boolean(plan),
    hasPaymentMethods: paymentMethods.length > 0,
    needsPaymentMethod,
    showTabs: isImmediatePlanChange && needsPaymentMethod,
  };
};
