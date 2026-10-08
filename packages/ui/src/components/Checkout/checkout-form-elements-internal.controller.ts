import { useState } from 'react';

export type PaymentMethodSource = 'existing' | 'new';

export const useCheckoutFormElementsInternalController = (hasPaymentMethods: boolean) => {
  const [paymentMethodSource, setPaymentMethodSource] = useState<PaymentMethodSource>(() =>
    hasPaymentMethods || __BUILD_DISABLE_RHC__ ? 'existing' : 'new',
  );

  return { paymentMethodSource, setPaymentMethodSource };
};
