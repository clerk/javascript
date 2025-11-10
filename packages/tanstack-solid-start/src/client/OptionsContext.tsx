import type { JSXElement } from 'solid-js';
import { createContext, useContext } from 'solid-js';

import type { TanstackStartClerkProviderProps as ClerkProviderProps } from './types';

type ClerkContextValue = Partial<Omit<ClerkProviderProps, 'children'>>;

const ClerkOptionsCtx = createContext<{ value: ClerkContextValue } | undefined>(undefined);

const useClerkOptions = (): ClerkContextValue => {
  const ctx = useContext(ClerkOptionsCtx);
  return ctx?.value ?? {};
};

const ClerkOptionsProvider = (props: { children: JSXElement; options: ClerkContextValue }) => {
  const { children, options } = props;
  return <ClerkOptionsCtx.Provider value={{ value: options }}>{children}</ClerkOptionsCtx.Provider>;
};

export { ClerkOptionsProvider, useClerkOptions };
