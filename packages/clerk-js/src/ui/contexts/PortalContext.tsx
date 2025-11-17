import type { PortalConfig } from '@clerk/shared/types';
import React from 'react';

const PortalContext = React.createContext<{ portal?: PortalConfig } | null>(null);

interface PortalProviderProps {
  children: React.ReactNode;
  portal?: PortalConfig;
}

export function PortalProvider({ children, portal }: PortalProviderProps): JSX.Element {
  return <PortalContext.Provider value={{ portal }}>{children}</PortalContext.Provider>;
}

export function usePortalContext(): PortalConfig | undefined {
  const context = React.useContext(PortalContext);
  return context?.portal;
}
