import { useUser } from '@clerk/shared/react/index';
import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import React, { type PropsWithChildren } from 'react';

/**
 * Shared form state for the ConfigureSSO wizard, persisted across step
 * route mounts and exposed to `WizardStep.shouldSkip` via `Wizard.Root`'s
 * `data` prop
 */
export interface ConfigureSSOData {
  /**
   * `true` if the user primary email address domain is already verified
   */
  domainAlreadyVerified: boolean;
  /**
   * The enterprise connection from the user's primary email address domain
   */
  enterpriseConnection: EnterpriseConnectionResource | undefined;
}

export type ConfigureSSOContextValue = ConfigureSSOData;

interface ConfigureSSOFlowProviderProps {
  /**
   * The user's enterprise connection, fetched by the parent so that
   * the wizard can show a loading state before mounting the panel.
   * `undefined` when the user has no enterprise connection
   */
  enterpriseConnection: EnterpriseConnectionResource | undefined;
}

const ConfigureSSOFlowContext = React.createContext<ConfigureSSOContextValue | null>(null);
ConfigureSSOFlowContext.displayName = 'ConfigureSSOFlowContext';

export const ConfigureSSOFlowProvider = ({
  enterpriseConnection,
  children,
}: PropsWithChildren<ConfigureSSOFlowProviderProps>): JSX.Element => {
  const { user } = useUser();

  const domainAlreadyVerified = user?.primaryEmailAddress?.verification.status === 'verified';

  const value = React.useMemo<ConfigureSSOContextValue>(
    () => ({
      enterpriseConnection,
      domainAlreadyVerified,
    }),
    [enterpriseConnection, domainAlreadyVerified],
  );

  return <ConfigureSSOFlowContext.Provider value={value}>{children}</ConfigureSSOFlowContext.Provider>;
};

export const useConfigureSSOFlow = (): ConfigureSSOContextValue => {
  const ctx = React.useContext(ConfigureSSOFlowContext);
  if (!ctx) {
    throw new Error('useConfigureSSOFlow called outside <ConfigureSSOFlowProvider>.');
  }
  return ctx;
};
