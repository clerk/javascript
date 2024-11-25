import React from 'react';

import type { PassedHooks } from './types';

type PassedHooksContextValue = PassedHooks;

const PassedHooksCtx = React.createContext<{ value: PassedHooksContextValue } | undefined>(undefined);
PassedHooksCtx.displayName = 'PassedHooksCtx';

const usePassedHooks = (): PassedHooksContextValue => {
  const ctx = React.useContext(PassedHooksCtx) as { value: PassedHooksContextValue };
  return ctx.value;
};

const PassedHooksProvider = (props: React.PropsWithChildren<{ options: PassedHooksContextValue }>) => {
  const { children, options } = props;
  return <PassedHooksCtx.Provider value={{ value: options }}>{children}</PassedHooksCtx.Provider>;
};

export { PassedHooksProvider, usePassedHooks };
