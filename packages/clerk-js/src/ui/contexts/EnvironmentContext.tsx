import { EnvironmentResource } from '@clerk/types';
import * as React from 'react';
import { assertContextExists } from 'ui/contexts/utils';

const EnvironmentContext = React.createContext<EnvironmentResource | null>(
  null,
);

interface EnvironmentProviderProps {
  children: React.ReactNode;
  value: any;
}

function EnvironmentProvider({
  children,
  value,
}: EnvironmentProviderProps): JSX.Element {
  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
}

function useEnvironment(): EnvironmentResource {
  const context = React.useContext(EnvironmentContext);
  assertContextExists(context, 'EnvironmentProvider');
  return context;
}

export { EnvironmentProvider, useEnvironment };
