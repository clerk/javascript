import React from 'react';

import type { ReactRouterClerkProviderProps } from './types';

type ClerkReactRouterContextValue = Partial<Omit<ReactRouterClerkProviderProps, 'children'>>;

const ClerkReactRouterOptionsCtx = React.createContext<{ value: ClerkReactRouterContextValue } | undefined>(undefined);
ClerkReactRouterOptionsCtx.displayName = 'ClerkReactRouterOptionsCtx';

const useClerkReactRouterOptions = (): ClerkReactRouterContextValue => {
  const ctx = React.useContext(ClerkReactRouterOptionsCtx) as { value: ClerkReactRouterContextValue };
  return ctx.value;
};

const ClerkReactRouterOptionsProvider = (props: React.PropsWithChildren<{ options: ClerkReactRouterContextValue }>) => {
  const { children, options } = props;
  return (
    <ClerkReactRouterOptionsCtx.Provider value={{ value: options }}>{children}</ClerkReactRouterOptionsCtx.Provider>
  );
};

export { ClerkReactRouterOptionsProvider, useClerkReactRouterOptions };
