import { createContext, useContext } from 'react';

import type { ConfigureIdentityProviderCtx } from '../../types';

export const ConfigureIdentityProviderContext = createContext<ConfigureIdentityProviderCtx | null>(null);

export const useConfigureIdentityProviderContext = () => {
  const context = useContext(ConfigureIdentityProviderContext);

  if (!context || context.componentName !== 'ConfigureIdentityProvider') {
    throw new Error('Clerk: useConfigureIdentityProviderContext called outside ConfigureIdentityProvider.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
