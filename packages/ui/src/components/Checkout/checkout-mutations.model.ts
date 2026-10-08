import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';

import type { CheckoutMutationsModel } from './checkout-mutations.types';
import { useCheckoutRequestScopeModel } from './checkout-request-scope.model';

export const useCheckoutMutationsModel = (): CheckoutMutationsModel => {
  const { checkout } = useCheckout();
  const scope = useCheckoutRequestScopeModel(checkout);

  return {
    requestKey: scope.requestKey,
    canRun: () => scope.canRun() && checkout.status === 'needs_confirmation',
    confirmCheckout: async (params, canContinue = () => true) => {
      if (!scope.canRun() || !canContinue() || checkout.status !== 'needs_confirmation') {
        return;
      }
      const { error } = await checkout.confirm({ ...params });
      if (!scope.canRun() || !canContinue()) {
        return;
      }
      if (error) {
        throw error;
      }
    },
  };
};
