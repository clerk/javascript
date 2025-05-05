import { createContext, useContext } from 'react';

import type { ManageApiKeysCtx } from '../../types';

export const ManageApiKeysContext = createContext<ManageApiKeysCtx | null>(null);

export const useManageApiKeysContext = () => {
  const context = useContext(ManageApiKeysContext);

  if (!context || context.componentName !== 'ManageApiKeys') {
    throw new Error('Clerk: useManageApiKeysContext called outside ManageApiKeys.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
