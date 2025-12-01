import type { ModuleManager } from '@clerk/shared/moduleManager';
import React from 'react';

const ModuleManagerContext = React.createContext<ModuleManager | undefined>(undefined);

export const ModuleManagerProvider: React.FC<React.PropsWithChildren<{ moduleManager: ModuleManager }>> = ({
  children,
  moduleManager,
}) => {
  return <ModuleManagerContext.Provider value={moduleManager}>{children}</ModuleManagerContext.Provider>;
};

export const useModuleManager = (): ModuleManager => {
  const context = React.useContext(ModuleManagerContext);
  if (!context) {
    throw new Error('useModuleManager must be used within a ModuleManagerProvider');
  }
  return context;
};
