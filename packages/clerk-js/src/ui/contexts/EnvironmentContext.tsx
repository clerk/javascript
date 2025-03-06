import type { EnvironmentResource } from '@clerk/types';
import * as React from 'react';

import { assertContextExists } from './utils';

const EnvironmentContext = React.createContext<EnvironmentResource | null>(null);

interface EnvironmentProviderProps {
  children: React.ReactNode;
  value: EnvironmentResource;
}

export function EnvironmentProvider({ children, value }: EnvironmentProviderProps): JSX.Element {
  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}

export function useEnvironment() {
  const context = React.useContext(EnvironmentContext);
  assertContextExists(context, 'EnvironmentProvider');

  return context;
}
