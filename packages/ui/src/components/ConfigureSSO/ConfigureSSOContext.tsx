import { useReverification } from '@clerk/shared/react';
import type { EnterpriseConnectionResource, UpdateMeEnterpriseConnectionParams } from '@clerk/shared/types';
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
   * Updates the current enterprise connection with the supplied params. The id
   * is taken implicitly from `enterpriseConnection` in context, so callers do
   * not need to thread it through. Throws when no enterprise connection is
   * loaded yet.
   */
  updateConnection: (params: UpdateMeEnterpriseConnectionParams) => Promise<EnterpriseConnectionResource | undefined>;
}

interface ConfigureSSOProviderProps {
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  updateEnterpriseConnection: (
    enterpriseConnectionId: string,
    params: UpdateMeEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource | undefined>;
}

const ConfigureSSOContext = React.createContext<ConfigureSSOData | null>(null);
ConfigureSSOContext.displayName = 'ConfigureSSOContext';

export const ConfigureSSOProvider = ({
  enterpriseConnection,
  updateEnterpriseConnection,
  children,
}: PropsWithChildren<ConfigureSSOProviderProps>): JSX.Element => {
  const [provider, setProvider] = React.useState<ProviderType | undefined>(
    enterpriseConnection?.provider as ProviderType,
  );

  const initialStepId = deriveInitialStep(enterpriseConnection);

  const updateConnectionFetcher = React.useCallback(
    async (params: UpdateMeEnterpriseConnectionParams) => {
      if (!enterpriseConnection) {
        throw new Error('Enterprise connection required');
      }

      return updateEnterpriseConnection(enterpriseConnection.id, params);
    },
    [enterpriseConnection, updateEnterpriseConnection],
  );

  const updateConnection = useReverification(updateConnectionFetcher);

  const value = React.useMemo<ConfigureSSOData>(
    () => ({
      initialStepId,
      enterpriseConnection,
      provider,
      setProvider,
      updateConnection,
    }),
    [initialStepId, enterpriseConnection, provider, updateConnection],
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
