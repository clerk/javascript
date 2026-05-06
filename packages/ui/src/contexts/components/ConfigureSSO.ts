import { createContext, useContext } from 'react';

import type { ConfigureSSOCtx } from '../../types';

export const ConfigureSSOContext = createContext<ConfigureSSOCtx | null>(null);

export const useConfigureSSOContext = () => {
  const context = useContext(ConfigureSSOContext);

  if (!context || context.componentName !== 'ConfigureSSO') {
    throw new Error('Clerk: useConfigureSSOContext called outside ConfigureSSO.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
