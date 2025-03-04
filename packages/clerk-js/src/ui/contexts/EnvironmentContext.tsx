import type { EnvironmentResource } from '@clerk/types';
import * as React from 'react';

import { assertContextExists } from './utils';

const EnvironmentContext = React.createContext<EnvironmentResource | null>(null);

interface EnvironmentProviderProps {
  children: React.ReactNode;
  value: EnvironmentResource;
}

type PartialEnvironment = EnvironmentResource & {
  authConfig: Partial<EnvironmentResource['authConfig']>;
  displayConfig: Partial<EnvironmentResource['displayConfig']>;
  organizationSettings: Partial<EnvironmentResource['organizationSettings']>;
  userSettings: Partial<EnvironmentResource['userSettings']>;
};

export function EnvironmentProvider({ children, value }: EnvironmentProviderProps): JSX.Element {
  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}

export function useEnvironment(): PartialEnvironment {
  const context = React.useContext(EnvironmentContext);
  assertContextExists(context, 'EnvironmentProvider');

  // @ts-expect-error - handle case where authConfig is not defined
  if (typeof context.authConfig === 'undefined') context.authConfig = {};
  // @ts-expect-error - handle case where displayConfig is not defined
  if (typeof context.displayConfig === 'undefined') context.displayConfig = {};
  // @ts-expect-error - handle case where organizationSettings is not defined
  if (typeof context.organizationSettings === 'undefined') context.organizationSettings = {};
  // @ts-expect-error - handle case where userSettings is not defined
  if (typeof context.userSettings === 'undefined') context.userSettings = {};

  return context;
}
