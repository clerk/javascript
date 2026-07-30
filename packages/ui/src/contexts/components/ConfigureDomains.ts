import { createContext, useContext } from 'react';

import type { ConfigureDomainsCtx } from '../../types';

export const ConfigureDomainsContext = createContext<ConfigureDomainsCtx | null>(null);

export const useConfigureDomainsContext = () => {
  const context = useContext(ConfigureDomainsContext);

  if (!context || context.componentName !== 'ConfigureDomains') {
    throw new Error('Clerk: useConfigureDomainsContext called outside ConfigureDomains.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
