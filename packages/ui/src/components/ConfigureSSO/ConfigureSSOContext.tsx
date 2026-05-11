import { useReverification, useSession, useUser } from '@clerk/shared/react';
import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import React, { type PropsWithChildren } from 'react';

export type ProviderType = 'saml_okta' | 'saml_custom';

/**
 * Shared form state for the ConfigureSSO wizard, persisted across steps
 */
export interface ConfigureSSOData {
  /**
   * The enterprise connection from the user's primary email address domain
   */
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  /**
   * Whether the underlying enterprise connection data is still loading
   */
  isLoading: boolean;
  /**
   * The provider selected for this configuration. Reads from the existing
   * enterprise connection when present, falling back to the local selection
   * made on the Select Provider step.
   */
  provider: ProviderType | undefined;
  /**
   * Sets the local provider selection used by Select Provider before a
   * connection has been created.
   */
  setProvider: (provider: ProviderType) => void;
  /**
   * Clears the local provider selection. Used by Reset on the Confirmation
   * step (wired up by a follow-up PR).
   */
  clearProvider: () => void;
  /**
   * Creates the enterprise connection from the current provider selection,
   * the user's primary email domain, and the session's active organization.
   * No-ops when an enterprise connection already exists so callers can
   * safely re-trigger.
   */
  createConnection: () => Promise<void>;
}

interface ConfigureSSOFlowProviderProps {
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  isLoading?: boolean;
}

const ConfigureSSOFlowContext = React.createContext<ConfigureSSOData | null>(null);
ConfigureSSOFlowContext.displayName = 'ConfigureSSOFlowContext';

export const ConfigureSSOFlowProvider = ({
  enterpriseConnection,
  isLoading = false,
  children,
}: PropsWithChildren<ConfigureSSOFlowProviderProps>): JSX.Element => {
  const { user } = useUser();
  const { session } = useSession();
  const [localProvider, setLocalProvider] = React.useState<ProviderType | undefined>(undefined);

  const provider = (enterpriseConnection?.provider as ProviderType | undefined) ?? localProvider;

  const createConnectionFetcher = React.useCallback(async () => {
    if (enterpriseConnection) {
      return;
    }
    if (!provider) {
      throw new Error('Provider not selected');
    }
    if (!user?.primaryEmailAddress) {
      throw new Error('Primary email required');
    }

    const emailDomain = user.primaryEmailAddress.emailAddress.split('@')[1];
    const organizationId = session?.lastActiveOrganizationId ?? null;

    await user.createEnterpriseConnection({
      provider,
      name: emailDomain,
      organizationId,
    });
  }, [enterpriseConnection, provider, user, session]);

  const createConnection = useReverification(createConnectionFetcher);

  const setProvider = React.useCallback((next: ProviderType) => {
    setLocalProvider(next);
  }, []);

  const clearProvider = React.useCallback(() => {
    setLocalProvider(undefined);
  }, []);

  const value = React.useMemo<ConfigureSSOData>(
    () => ({
      enterpriseConnection,
      isLoading,
      provider,
      setProvider,
      clearProvider,
      createConnection,
    }),
    [enterpriseConnection, isLoading, provider, setProvider, clearProvider, createConnection],
  );

  return <ConfigureSSOFlowContext.Provider value={value}>{children}</ConfigureSSOFlowContext.Provider>;
};

export const useConfigureSSOFlow = (): ConfigureSSOData => {
  const ctx = React.useContext(ConfigureSSOFlowContext);
  if (!ctx) {
    throw new Error('useConfigureSSOFlow called outside <ConfigureSSOFlowProvider>.');
  }
  return ctx;
};
