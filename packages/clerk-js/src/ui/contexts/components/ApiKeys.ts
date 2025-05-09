import { createContext, useContext } from 'react';

import type { ApiKeysCtx } from '../../types';

export const ApiKeysContext = createContext<ApiKeysCtx | null>(null);

export const useApiKeysContext = () => {
  const context = useContext(ApiKeysContext);

  if (!context || context.componentName !== 'ApiKeys') {
    throw new Error('Clerk: useApiKeysContext called outside ApiKeys.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
