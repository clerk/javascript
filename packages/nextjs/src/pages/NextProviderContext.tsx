import type { ClerkProviderProps } from '@clerk/clerk-react';
import React from 'react';

type ClerkNextContextValue = Omit<ClerkProviderProps, 'children'>;

const ClerkNextContext = React.createContext<{ value: ClerkNextContextValue } | undefined>(undefined);
ClerkNextContext.displayName = 'ClerkNextContext';

const useClerkNextContext = () => {
  const ctx = React.useContext(ClerkNextContext);
  return (ctx as any).value as ClerkNextContextValue;
};

const ClerkNextProvider = (props: ClerkProviderProps) => {
  const { children, ...restProps } = props;
  const ctxValue = { value: restProps };

  return <ClerkNextContext.Provider value={ctxValue}>{children}</ClerkNextContext.Provider>;
};

export { ClerkNextProvider, useClerkNextContext };
