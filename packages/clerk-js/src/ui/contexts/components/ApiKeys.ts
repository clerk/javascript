import { createContext, useContext } from 'react';

import type { APIKeysCtx } from '../../types';

export const ApiKeysContext = createContext<APIKeysCtx | null>(null);

export const useApiKeysContext = () => {
  const context = useContext(ApiKeysContext);

  if (!context || context.componentName !== 'APIKeys') {
    throw new Error('Clerk: useApiKeysContext called outside ApiKeys.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
