import React from 'react';

import type { TanstackStartClerkProviderProps as ClerkProviderProps } from './types';

type ClerkContextValue = Partial<Omit<ClerkProviderProps, 'children'>>;

const ClerkOptionsCtx = React.createContext<{ value: ClerkContextValue } | undefined>(undefined);
ClerkOptionsCtx.displayName = 'ClerkOptionsCtx';

const useClerkOptions = (): ClerkContextValue => {
  const ctx = React.useContext(ClerkOptionsCtx) as { value: ClerkContextValue };
  return ctx.value;
};

const ClerkOptionsProvider = (props: React.PropsWithChildren<{ options: ClerkContextValue }>) => {
  const { children, options } = props;
  return <ClerkOptionsCtx.Provider value={{ value: options }}>{children}</ClerkOptionsCtx.Provider>;
};

export { ClerkOptionsProvider, useClerkOptions };
