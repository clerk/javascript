import type { PortalConfig } from '@clerk/shared/types';
import React, { createContext, useContext } from 'react';

// PortalProvider context for passing portal config to Clerk components
const PortalContext = createContext<PortalConfig | undefined>(undefined);

interface PortalProviderProps {
  children: React.ReactNode;
  portal?: PortalConfig;
}

export function PortalProvider({ children, portal }: PortalProviderProps): JSX.Element {
  return <PortalContext.Provider value={portal}>{children}</PortalContext.Provider>;
}

// Hook to get portal config from context (for internal use)
export function usePortalConfig(): PortalConfig | undefined {
  return useContext(PortalContext);
}
