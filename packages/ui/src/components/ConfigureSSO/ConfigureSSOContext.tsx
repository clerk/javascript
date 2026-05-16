import type { UseUserEnterpriseConnectionsReturn } from '@clerk/shared/react/index';
import { useSession, useUser } from '@clerk/shared/react/index';
import type {
  EmailAddressResource,
  EnterpriseConnectionResource,
  SignedInSessionResource,
  UserResource,
} from '@clerk/shared/types';
import React, { type PropsWithChildren, useCallback } from 'react';

import { useCardState } from '@/elements/contexts';

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
   * Creates a new enterprise connection
   */
  createEnterpriseConnection: (provider: ProviderType, primaryEmailAddress?: EmailAddressResource) => Promise<void>;
  /**
   * Updates an existing enterprise connection
   */
  updateEnterpriseConnection: UseUserEnterpriseConnectionsReturn['updateEnterpriseConnection'];
  /**
   * Deletes an enterprise connection
   */
  deleteEnterpriseConnection: UseUserEnterpriseConnectionsReturn['deleteEnterpriseConnection'];
  /**
   * Determines if the user's domain is already wired to an enterprise connection that
   * doesn't belong to the org they're currently configuring
   */
  isDomainTakenByOtherOrg: boolean;
}

interface ConfigureSSOProviderProps {
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  hasSuccessfulTestRun: boolean;
  contentRef: React.RefObject<HTMLDivElement>;
  createEnterpriseConnection: UseUserEnterpriseConnectionsReturn['createEnterpriseConnection'];
  updateEnterpriseConnection: UseUserEnterpriseConnectionsReturn['updateEnterpriseConnection'];
  deleteEnterpriseConnection: UseUserEnterpriseConnectionsReturn['deleteEnterpriseConnection'];
}

const ConfigureSSOContext = React.createContext<ConfigureSSOData | null>(null);
ConfigureSSOContext.displayName = 'ConfigureSSOContext';

export const ConfigureSSOProvider = ({
  enterpriseConnection,
  hasSuccessfulTestRun,
  contentRef,
  createEnterpriseConnection: createEnterpriseConnectionApi,
  updateEnterpriseConnection,
  deleteEnterpriseConnection,
  children,
}: PropsWithChildren<ConfigureSSOProviderProps>): JSX.Element => {
  const [provider, setProvider] = React.useState<ProviderType | undefined>(
    enterpriseConnection?.provider as ProviderType,
  );
  const { session } = useSession();
  const { user } = useUser();
  const card = useCardState();

  const isDomainTakenByOtherOrg = checkDomainTakenByOtherOrg(user, session, enterpriseConnection);
  const initialStepId = deriveInitialStep(enterpriseConnection, { isDomainTakenByOtherOrg, hasSuccessfulTestRun });

  const createEnterpriseConnection = useCallback(
    async (provider: ProviderType, primaryEmailAddress?: EmailAddressResource): Promise<void> => {
      const emailDomain = primaryEmailAddress?.emailAddress.split('@')[1];
      const organizationId = session?.lastActiveOrganizationId ?? null;

      if (!emailDomain) {
        return;
      }

      card.setLoading();

      try {
        await createEnterpriseConnectionApi({
          provider,
          name: emailDomain,
          organizationId,
        });
      } finally {
        card.setIdle();
      }
    },
    [card, session, createEnterpriseConnectionApi],
  );

  const value = React.useMemo<ConfigureSSOData>(
    () => ({
      provider,
      contentRef,
      setProvider,
      initialStepId,
      enterpriseConnection,
      isDomainTakenByOtherOrg,
      createEnterpriseConnection,
      updateEnterpriseConnection,
      deleteEnterpriseConnection,
    }),
    [
      provider,
      contentRef,
      initialStepId,
      enterpriseConnection,
      createEnterpriseConnection,
      updateEnterpriseConnection,
      deleteEnterpriseConnection,
      isDomainTakenByOtherOrg,
    ],
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

/**
 * Determines if the user's domain is already wired to an enterprise connection that
 * doesn't belong to the org they're currently configuring
 */
const checkDomainTakenByOtherOrg = (
  user: UserResource | null | undefined,
  session: SignedInSessionResource | null | undefined,
  enterpriseConnection: EnterpriseConnectionResource | undefined,
): boolean => {
  const emailToVerify =
    user?.primaryEmailAddress ?? user?.emailAddresses?.find(e => e.verification.status !== 'verified');
  const isVerified = emailToVerify?.verification.status === 'verified';
  const activeOrganizationId = session?.lastActiveOrganizationId ?? null;

  return Boolean(isVerified && enterpriseConnection && enterpriseConnection.organizationId !== activeOrganizationId);
};
