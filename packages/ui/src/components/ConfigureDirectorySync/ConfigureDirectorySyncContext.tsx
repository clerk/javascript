import React, { type PropsWithChildren } from 'react';

import type { ConfigureDirectorySyncData } from './configure-directory-sync.types';
import { useConfigureDirectorySyncContextController } from './configure-directory-sync-context.controller';
import { useConfigureDirectorySyncContextModel } from './configure-directory-sync-context.model';

export type { ConfigureDirectorySyncData } from './configure-directory-sync.types';

const ConfigureDirectorySyncContext = React.createContext<ConfigureDirectorySyncData | null>(null);
ConfigureDirectorySyncContext.displayName = 'ConfigureDirectorySyncContext';

type ConfigureDirectorySyncProviderProps = PropsWithChildren<{
  onExit?: () => void;
}>;

export const ConfigureDirectorySyncProvider = ({
  onExit,
  children,
}: ConfigureDirectorySyncProviderProps): JSX.Element => {
  const model = useConfigureDirectorySyncContextModel();
  const value = useConfigureDirectorySyncContextController(model, onExit);
  return (
    <ConfigureDirectorySyncContext.Provider
      key={model.requestKey}
      value={value}
    >
      {children}
    </ConfigureDirectorySyncContext.Provider>
  );
};

export const useConfigureDirectorySync = (): ConfigureDirectorySyncData => {
  const ctx = React.useContext(ConfigureDirectorySyncContext);
  if (!ctx) {
    throw new Error('useConfigureDirectorySync called outside <ConfigureDirectorySyncProvider>.');
  }
  return ctx;
};
