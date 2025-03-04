import type { EnvironmentResource } from '@clerk/types';
import * as React from 'react';

import { assertContextExists } from './utils';

const EnvironmentContext = React.createContext<EnvironmentResource | null>(null);

interface EnvironmentProviderProps {
  children: React.ReactNode;
  value: EnvironmentResource;
}

type PartialEnvironment = EnvironmentResource & {
  displayConfig: Partial<EnvironmentResource['displayConfig']>;
  userSettings: Partial<EnvironmentResource['userSettings']>;
};

export function EnvironmentProvider({ children, value }: EnvironmentProviderProps): JSX.Element {
  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}

const DISPLAY_CONFIG = {};
const USER_SETTINGS = {
  attributes: {},
  authenticatableSocialStrategies: [],
  authenticatableStrategies: [],
  authenticatableStrategiesWithSocial: [],
  authenticatableStrategiesWithoutSocial: [],
  emailVerificationRequired: false,
  enabledFirstFactorIdentifiers: [],
  passkeySettings: {},
  passwordResetRequired: false,
  signUp: {},
  web3FirstFactors: [],
};

export function useEnvironment(): PartialEnvironment {
  const context = React.useContext(EnvironmentContext);
  assertContextExists(context, 'EnvironmentProvider');

  console.log('environment context:', context);

  // @ts-expect-error - handle case where displayConfig is not defined
  if (typeof context.displayConfig === 'undefined') context.displayConfig = DISPLAY_CONFIG;
  // @ts-expect-error - handle case where userSettings is not defined
  if (typeof context.userSettings === 'undefined') context.userSettings = USER_SETTINGS;

  return context;
}
