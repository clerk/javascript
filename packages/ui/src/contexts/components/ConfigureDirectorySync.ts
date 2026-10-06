import { createContext, useContext } from 'react';

import type { ConfigureDirectorySyncCtx } from '../../types';

export const ConfigureDirectorySyncContext = createContext<ConfigureDirectorySyncCtx | null>(null);

export const useConfigureDirectorySyncContext = () => {
  const context = useContext(ConfigureDirectorySyncContext);

  if (!context || context.componentName !== 'ConfigureDirectorySync') {
    throw new Error('Clerk: useConfigureDirectorySyncContext called outside ConfigureDirectorySync.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
