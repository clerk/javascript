import type {
  CreateMeEnterpriseConnectionParams,
  DeletedObjectResource,
  EnterpriseConnectionResource,
  MeEnterpriseConnectionProvider,
  UpdateMeEnterpriseConnectionParams,
} from '@clerk/shared/types';
import React, { type PropsWithChildren } from 'react';

/**
 * Identity providers exposed in the wizard. Only `saml_okta` is wired
 * end-to-end for the PoC; the rest are intentionally inert and
 * surfaced as disabled options
 */
export type ConfigureSSOSupportedProvider = MeEnterpriseConnectionProvider;

/**
 * Shared form state for the ConfigureSSO wizard, persisted across steps
 */
export interface ConfigureSSOData {
  /**
   * The enterprise connection from the user's primary email address domain
   */
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  /**
   * The provider the user picked on the first step. Drives the
   * `provider` field sent to the FAPI Create endpoint
   */
  selectedProvider: ConfigureSSOSupportedProvider | undefined;
}

export interface ConfigureSSOContextValue extends ConfigureSSOData {
  /**
   * `true` while the parent is still fetching the user's enterprise
   * connection
   */
  isLoading: boolean;
  setSelectedProvider: (provider: ConfigureSSOSupportedProvider | undefined) => void;
  createEnterpriseConnection: (
    params: CreateMeEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource | undefined>;
  updateEnterpriseConnection: (
    enterpriseConnectionId: string,
    params: UpdateMeEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource | undefined>;
  deleteEnterpriseConnection: (enterpriseConnectionId: string) => Promise<DeletedObjectResource | undefined>;
  revalidate: () => Promise<void>;
}

interface ConfigureSSOFlowProviderProps {
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  isLoading: boolean;
  createEnterpriseConnection: (
    params: CreateMeEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource | undefined>;
  updateEnterpriseConnection: (
    enterpriseConnectionId: string,
    params: UpdateMeEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource | undefined>;
  deleteEnterpriseConnection: (enterpriseConnectionId: string) => Promise<DeletedObjectResource | undefined>;
  revalidate: () => Promise<void>;
}

const ConfigureSSOFlowContext = React.createContext<ConfigureSSOContextValue | null>(null);
ConfigureSSOFlowContext.displayName = 'ConfigureSSOFlowContext';

export const ConfigureSSOFlowProvider = ({
  enterpriseConnection,
  isLoading,
  createEnterpriseConnection,
  updateEnterpriseConnection,
  deleteEnterpriseConnection,
  revalidate,
  children,
}: PropsWithChildren<ConfigureSSOFlowProviderProps>): JSX.Element => {
  const [selectedProvider, setSelectedProvider] = React.useState<ConfigureSSOSupportedProvider | undefined>(
    enterpriseConnection?.provider as ConfigureSSOSupportedProvider | undefined,
  );

  // Adopt the provider of the existing connection once it's fetched, so
  // the user lands on the configure step pre-populated when they
  // re-enter the wizard
  React.useEffect(() => {
    if (enterpriseConnection?.provider && !selectedProvider) {
      setSelectedProvider(enterpriseConnection.provider as ConfigureSSOSupportedProvider);
    }
  }, [enterpriseConnection?.provider, selectedProvider]);

  const value = React.useMemo<ConfigureSSOContextValue>(
    () => ({
      enterpriseConnection,
      isLoading,
      selectedProvider,
      setSelectedProvider,
      createEnterpriseConnection,
      updateEnterpriseConnection,
      deleteEnterpriseConnection,
      revalidate,
    }),
    [
      enterpriseConnection,
      isLoading,
      selectedProvider,
      createEnterpriseConnection,
      updateEnterpriseConnection,
      deleteEnterpriseConnection,
      revalidate,
    ],
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
