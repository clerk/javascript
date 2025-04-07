import { createContext, useContext } from 'react';

import type { __experimental_PaymentSourcesCtx } from '../../types';

export const __experimental_PaymentSourcesContext = createContext<__experimental_PaymentSourcesCtx | null>(null);

export const usePaymentSourcesContext = () => {
  const context = useContext(__experimental_PaymentSourcesContext);

  if (!context || context.componentName !== 'PaymentSources') {
    throw new Error('Clerk: usePaymentSourcesContext called outside PaymentSources.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
