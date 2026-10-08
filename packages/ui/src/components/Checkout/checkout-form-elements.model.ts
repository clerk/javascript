import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';

import { usePaymentMethods } from '../../contexts';

export const useCheckoutFormElementsModel = () => {
  const { checkout } = useCheckout();
  const { isLoading } = usePaymentMethods();

  return { hasPlan: Boolean(checkout.plan), isLoading };
};
