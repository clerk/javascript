import React from 'react';

import type { NextClerkProviderProps } from '../types';

type ClerkNextContextValue = Partial<Omit<NextClerkProviderProps, 'children'>>;

const ClerkNextOptionsCtx = React.createContext<{ value: ClerkNextContextValue } | undefined>(undefined);
ClerkNextOptionsCtx.displayName = 'ClerkNextOptionsCtx';

const useClerkNextOptions = () => {
  const ctx = React.useContext(ClerkNextOptionsCtx)!;
  return ctx.value as ClerkNextContextValue;
};

const ClerkNextOptionsProvider = (props: React.PropsWithChildren<{ options: ClerkNextContextValue }>) => {
  const { children, options } = props;
  return <ClerkNextOptionsCtx.Provider value={{ value: options }}>{children}</ClerkNextOptionsCtx.Provider>;
};

export { ClerkNextOptionsProvider, useClerkNextOptions };
