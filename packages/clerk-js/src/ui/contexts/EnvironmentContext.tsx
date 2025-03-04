import type { EnvironmentResource } from '@clerk/types';
import * as React from 'react';

import { assertContextExists } from './utils';

const EnvironmentContext = React.createContext<EnvironmentResource | null>(null);

interface EnvironmentProviderProps {
  children: React.ReactNode;
  value: EnvironmentResource;
}

type PartialEnvironmentResource = EnvironmentResource & {
  authConfig: Partial<EnvironmentResource['authConfig']>;
  displayConfig: Partial<EnvironmentResource['displayConfig']>;
  organizationSettings: Partial<EnvironmentResource['organizationSettings']>;
  userSettings: Partial<EnvironmentResource['userSettings']>;
};

export function EnvironmentProvider({ children, value }: EnvironmentProviderProps): JSX.Element {
  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}

export function useEnvironment(): PartialEnvironmentResource {
  const context = React.useContext(EnvironmentContext);
  assertContextExists(context, 'EnvironmentProvider');

  context.authConfig = context.authConfig ?? {};
  context.displayConfig = context.displayConfig ?? {};
  context.organizationSettings = context.organizationSettings ?? {};
  context.userSettings = context.userSettings ?? {};

  return context;
}
