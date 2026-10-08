import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';

import { useCheckoutContext } from '../../contexts';
import { localizationKeys, useLocalizations } from '../../customizables';

export const useCheckoutSubmitLabelModel = () => {
  const { checkout } = useCheckout();
  const { seatsQuantity } = useCheckoutContext();
  const { $ } = useLocalizations();
  const { status, freeTrialEndsAt, totals } = checkout;

  if (status === 'needs_initialization') {
    throw new Error('Clerk: Invalid state');
  }

  if (freeTrialEndsAt) {
    if (seatsQuantity && totals.totalDueNow) {
      return localizationKeys('billing.pay', { amount: $(totals.totalDueNow) });
    }
    return localizationKeys('billing.startFreeTrial');
  }

  if (totals.totalDueNow && totals.totalDueNow.amount > 0) {
    return localizationKeys('billing.pay', { amount: $(totals.totalDueNow) });
  }

  return localizationKeys('billing.subscribe');
};
