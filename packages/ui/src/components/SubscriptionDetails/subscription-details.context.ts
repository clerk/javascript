import { createContext } from 'react';

import type { SubscriptionCancellation } from './subscription-details.types';

export const SubscriptionForCancellationContext = createContext<SubscriptionCancellation>({
  confirmationOpen: false,
  setConfirmationOpen: () => {},
  subscriptionId: null,
  setSubscriptionId: () => {},
});
