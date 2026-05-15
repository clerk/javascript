import { __internal_useUserEnterpriseConnections, useSession, useUser } from '@clerk/shared/react/index';
import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import React, { type PropsWithChildren, useCallback } from 'react';

import { useCardState } from '@/elements/contexts';
import { handleError } from '@/utils/errorHandler';

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
   * Ref to the scrollable content container of the wizard.
   */
  contentRef: React.RefObject<HTMLDivElement>;
  /**
   * Creates a new enterprise connection.
   */
  createEnterpriseConnection: (provider: ProviderType) => Promise<void>;
}

interface ConfigureSSOProviderProps {
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  contentRef: React.RefObject<HTMLDivElement>;
}

const ConfigureSSOContext = React.createContext<ConfigureSSOData | null>(null);
ConfigureSSOContext.displayName = 'ConfigureSSOContext';

export const ConfigureSSOProvider = ({
  enterpriseConnection,
  contentRef,
  children,
}: PropsWithChildren<ConfigureSSOProviderProps>): JSX.Element => {
  const [provider, setProvider] = React.useState<ProviderType | undefined>(
    enterpriseConnection?.provider as ProviderType,
  );
  const enterpriseConnectionApi = __internal_useUserEnterpriseConnections();
  const { user } = useUser();
  const { session } = useSession();
  const card = useCardState();
  const initialStepId = deriveInitialStep(enterpriseConnection);

  const createEnterpriseConnection = useCallback(
    async (provider: ProviderType): Promise<void> => {
      const emailDomain = user?.primaryEmailAddress?.emailAddress.split('@')[1];
      const organizationId = session?.lastActiveOrganizationId ?? null;

      if (!emailDomain) {
        return;
      }

      card.setLoading();

      await enterpriseConnectionApi
        .createEnterpriseConnection({
          provider,
          name: emailDomain,
          organizationId,
        })
        .catch(err => {
          handleError(err, [], card.setError);
        })
        .finally(() => {
          card.setIdle();
        });
    },
    [user, card, session, enterpriseConnectionApi],
  );

  const value = React.useMemo<ConfigureSSOData>(
    () => ({
      initialStepId,
      enterpriseConnection,
      provider,
      createEnterpriseConnection,
      setProvider,
      contentRef,
    }),
    [initialStepId, enterpriseConnection, createEnterpriseConnection, provider, contentRef],
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
