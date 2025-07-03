import { createContext, useContext } from 'react';

import type { SubscriptionDetailsCtx } from '@/ui/types';

export const SubscriptionDetailsContext = createContext<SubscriptionDetailsCtx | null>(null);

export const useSubscriptionDetailsContext = () => {
  const context = useContext(SubscriptionDetailsContext);

  if (!context || context.componentName !== 'SubscriptionDetails') {
    throw new Error('Clerk: useSubscriptionDetailsContext called outside SubscriptionDetails.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
