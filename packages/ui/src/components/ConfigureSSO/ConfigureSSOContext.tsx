import { useReverification, useSession, useUser } from '@clerk/shared/react';
import type { CreateMeEnterpriseConnectionParams, EnterpriseConnectionResource } from '@clerk/shared/types';
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

interface ConfigureSSOProviderProps {
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  createEnterpriseConnection: (
    params: CreateMeEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource | undefined>;
}

const ConfigureSSOContext = React.createContext<ConfigureSSOData | null>(null);
ConfigureSSOContext.displayName = 'ConfigureSSOContext';

export const ConfigureSSOProvider = ({
  enterpriseConnection,
  createEnterpriseConnection,
  children,
}: PropsWithChildren<ConfigureSSOProviderProps>): JSX.Element => {
  const { user } = useUser();
  const { session } = useSession();
  const [provider, setProvider] = React.useState<ProviderType | undefined>(
    enterpriseConnection?.provider as ProviderType,
  );

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
      provider,
      setProvider,
      createConnection,
    }),
    [initialStepId, enterpriseConnection, provider, createConnection],
  );

  return <ConfigureSSOContext.Provider value={value}>{children}</ConfigureSSOContext.Provider>;
};

export const useConfigureSSO = (): ConfigureSSOData => {
  const ctx = React.useContext(ConfigureSSOContext);
  if (!ctx) {
    throw new Error('useConfigureSSO called outside <ConfigureSSOProvider>.');
  }
  return ctx;
};
