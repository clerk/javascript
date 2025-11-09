import { createContext, useContext } from 'react';

import type { APIKeysCtx } from '../../types';

export const APIKeysContext = createContext<APIKeysCtx | null>(null);

export const useAPIKeysContext = () => {
  const context = useContext(APIKeysContext);

  if (!context || context.componentName !== 'APIKeys') {
    throw new Error('Clerk: useAPIKeysContext called outside APIKeys.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
