import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import React, { type PropsWithChildren } from 'react';

import type { WizardFacts } from './data/deriveFacts';
import type { ConfigureSSOMutations } from './data/useConfigureSSOMutations';
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
   * Every connection-domain mutation the wizard performs, pre-wrapped in
   * `useReverification`. Steps read these from context instead of wrapping
   * inline or prop-drilling raw mutation handles.
   */
  mutations: ConfigureSSOMutations;
  /**
   * Determines if the user's domain is already wired to an enterprise connection that
   * doesn't belong to the org they're currently configuring
   */
  isDomainTakenByOtherOrg: boolean;
  /**
   * The single set of derived booleans the wizard makes decisions from,
   * computed once upstream by `useConfigureSSOData`. Steps read display gates
   * from here instead of re-deriving from `useUser`/`useSession`.
   */
  facts: WizardFacts;
  /**
   * Re-runs the successful-test-run probe so `facts.hasSuccessfulTestRun`
   * reflects a run that just completed.
   */
  refreshTestRuns: () => Promise<unknown>;
}

interface ConfigureSSOProviderProps {
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  /**
   * Derived booleans the wizard makes decisions from, computed upstream by
   * `useConfigureSSOData`. The provider never derives state itself.
   */
  facts: WizardFacts;
  /**
   * Re-runs the successful-test-run probe owned by `useConfigureSSOData`.
   */
  refreshTestRuns: () => Promise<unknown>;
  contentRef: React.RefObject<HTMLDivElement>;
  /**
   * The bundle of reverification-wrapped connection mutations, built upstream by
   * `useConfigureSSOData`. Replaces the three raw mutation handles the provider
   * used to take individually.
   */
  mutations: ConfigureSSOMutations;
}

const ConfigureSSOContext = React.createContext<ConfigureSSOData | null>(null);
ConfigureSSOContext.displayName = 'ConfigureSSOContext';

export const ConfigureSSOProvider = ({
  enterpriseConnection,
  facts,
  refreshTestRuns,
  contentRef,
  mutations,
  children,
}: PropsWithChildren<ConfigureSSOProviderProps>): JSX.Element => {
  const [provider, setProvider] = React.useState<ProviderType | undefined>(
    enterpriseConnection?.provider as ProviderType,
  );

  const { isDomainTakenByOtherOrg, hasSuccessfulTestRun } = facts;
  const initialStepId = deriveInitialStep(enterpriseConnection, { isDomainTakenByOtherOrg, hasSuccessfulTestRun });

  const value = React.useMemo<ConfigureSSOData>(
    () => ({
      provider,
      contentRef,
      setProvider,
      initialStepId,
      enterpriseConnection,
      isDomainTakenByOtherOrg,
      facts,
      refreshTestRuns,
      mutations,
    }),
    [
      provider,
      contentRef,
      initialStepId,
      enterpriseConnection,
      mutations,
      isDomainTakenByOtherOrg,
      facts,
      refreshTestRuns,
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
