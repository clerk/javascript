import { __internal_useUserEnterpriseConnections, useReverification, useSession, useUser } from '@clerk/shared/react';
import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import React, { type PropsWithChildren } from 'react';

import { deriveInitialStep } from './deriveInitialStep';
import type { ProviderType, WizardStepId } from './types';

/**
 * Shared form state for the ConfigureSSO wizard, persisted across steps
 */
export interface ConfigureSSOData {
  initialStepId: WizardStepId;
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
   * Creates the enterprise connection for the supplied provider, the user's
   * primary email domain, and the session's active organization. No-ops when
   * an enterprise connection already exists so callers can safely re-trigger.
   */
  createConnection: (provider: ProviderType) => Promise<void>;
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
  const [provider, setProvider] = React.useState<ProviderType | undefined>(
    enterpriseConnection?.provider as ProviderType,
  );

  const { createEnterpriseConnection } = __internal_useUserEnterpriseConnections();

  const initialStepId = deriveInitialStep(enterpriseConnection);

  const createConnectionFetcher = React.useCallback(
    async (selectedProvider: ProviderType) => {
      if (enterpriseConnection) {
        return;
      }
      if (!user?.primaryEmailAddress) {
        throw new Error('Primary email required');
      }

      const emailDomain = user.primaryEmailAddress.emailAddress.split('@')[1];
      const organizationId = session?.lastActiveOrganizationId ?? null;

      await createEnterpriseConnection({
        provider: selectedProvider,
        name: emailDomain,
        organizationId,
      });
    },
    [enterpriseConnection, user, session, createEnterpriseConnection],
  );

  const createConnection = useReverification(createConnectionFetcher);

  const value = React.useMemo<ConfigureSSOData>(
    () => ({
      initialStepId,
      enterpriseConnection,
      isLoading,
      provider,
      setProvider,
      createConnection,
    }),
    [initialStepId, enterpriseConnection, isLoading, provider, createConnection],
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
