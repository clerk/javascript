import { useCardState } from '@/ui/elements/contexts';

import { useTabState } from '../../hooks/useTabState';
import type { BillingPageData } from './billing-page.types';

const tabMap = {
  0: 'subscriptions',
  1: 'statements',
  2: 'payments',
} as const;

export const useBillingPageController = (subscriberType: 'user' | 'organization'): BillingPageData => {
  const card = useCardState();
  const { selectedTab, handleTabChange } = useTabState(tabMap);
  return { subscriberType, error: card.error, selectedTab, handleTabChange };
};
