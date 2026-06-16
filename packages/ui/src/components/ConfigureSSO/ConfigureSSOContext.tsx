import type { EnterpriseConnectionResource, OrganizationDomainResource } from '@clerk/shared/types';
import React, { type PropsWithChildren } from 'react';

import type { OrganizationEnterpriseConnection } from './domain/organizationEnterpriseConnection';
import type {
  EnterpriseConnectionMutations,
  OrganizationDomainMutations,
  TestRunsView,
} from './hooks/useOrganizationEnterpriseConnection';

export type { OrganizationDomainMutations };

/**
 * Shared state for the ConfigureSSO wizard, persisted across steps. Everything
 * is sourced from the umbrella `useOrganizationEnterpriseConnection` hook one
 * level up, so the context never observes a loading state and the steps read
 * display gates / mutations from a single place instead of re-deriving.
 */
export interface ConfigureSSOData {
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  /** Ref to the wizard's scrollable content container. */
  contentRef: React.RefObject<HTMLDivElement>;
  enterpriseConnectionMutations: EnterpriseConnectionMutations;
  organizationDomainMutations: OrganizationDomainMutations;
  organizationEnterpriseConnection: OrganizationEnterpriseConnection;
  testRuns: TestRunsView;
  organizationDomains: OrganizationDomainResource[] | undefined;
  /** Exits the wizard back to the host; absent on the standalone mount. Reused by the back control and the future "Skip for now". */
  onExit?: () => void;
}

interface ConfigureSSOProviderProps {
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  organizationEnterpriseConnection: OrganizationEnterpriseConnection;
  testRuns: TestRunsView;
  organizationDomains: OrganizationDomainResource[] | undefined;
  contentRef: React.RefObject<HTMLDivElement>;
  enterpriseConnectionMutations: EnterpriseConnectionMutations;
  organizationDomainMutations: OrganizationDomainMutations;
  onExit?: () => void;
}

const ConfigureSSOContext = React.createContext<ConfigureSSOData | null>(null);
ConfigureSSOContext.displayName = 'ConfigureSSOContext';

export const ConfigureSSOProvider = ({
  enterpriseConnection,
  organizationEnterpriseConnection,
  testRuns,
  organizationDomains,
  contentRef,
  enterpriseConnectionMutations,
  organizationDomainMutations,
  onExit,
  children,
}: PropsWithChildren<ConfigureSSOProviderProps>): JSX.Element => {
  const value = React.useMemo<ConfigureSSOData>(
    () => ({
      contentRef,
      enterpriseConnection,
      organizationEnterpriseConnection,
      testRuns,
      organizationDomains,
      enterpriseConnectionMutations,
      organizationDomainMutations,
      onExit,
    }),
    [
      contentRef,
      enterpriseConnectionMutations,
      organizationDomainMutations,
      organizationEnterpriseConnection,
      testRuns,
      organizationDomains,
      enterpriseConnection,
      onExit,
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
