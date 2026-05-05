import { useUser } from '@clerk/shared/react/index';
import type { EmailAddressResource, EnterpriseConnectionResource } from '@clerk/shared/types';
import React, { type PropsWithChildren } from 'react';

/**
 * Shared form state for the ConfigureSSO wizard, persisted across step
 * route mounts and exposed to `WizardStep.shouldSkip` via `Wizard.Root`'s
 * `data` prop
 */
export interface ConfigureSSOData {
  /** The primary email address of the current user */
  primaryEmailAddress?: EmailAddressResource | null;
  /**
   * The enterprise connection from the user's primary email address domain
   */
  enterpriseConnection: EnterpriseConnectionResource | undefined;
}

export interface ConfigureSSOContextValue extends ConfigureSSOData {
  /**
   * `true` while the parent is still fetching the user's enterprise
   * connection
   */
  isLoading: boolean;
}

interface ConfigureSSOFlowProviderProps {
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  isLoading: boolean;
}

const ConfigureSSOFlowContext = React.createContext<ConfigureSSOContextValue | null>(null);
ConfigureSSOFlowContext.displayName = 'ConfigureSSOFlowContext';

export const ConfigureSSOFlowProvider = ({
  enterpriseConnection,
  isLoading,
  children,
}: PropsWithChildren<ConfigureSSOFlowProviderProps>): JSX.Element => {
  const { user } = useUser();

  const value = React.useMemo<ConfigureSSOContextValue>(
    () => ({
      primaryEmailAddress: user?.primaryEmailAddress,
      enterpriseConnection,
      isLoading,
    }),
    [user?.primaryEmailAddress, enterpriseConnection, isLoading],
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
