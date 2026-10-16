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
 * Shared state for the ConfigureSSO wizard, persisted across steps. Connection
 * state is sourced from the umbrella `useOrganizationEnterpriseConnection` hook
 * one level up, so the context never observes a loading state and the steps read
 * display gates / mutations from a single place instead of re-deriving.
 */
export interface ConfigureSSOData {
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  /** The scoped connection's domains, a draft while the scope is `new`. */
  connectionDomains: string[];
  setConnectionDomains: (domains: string[]) => Promise<void>;
  /** Domains other connections of the organization authenticate, keyed to that connection's name. */
  claimedDomains: Map<string, string>;
  /** Ref to the wizard's scrollable content container. */
  contentRef: React.RefObject<HTMLDivElement>;
  enterpriseConnectionMutations: EnterpriseConnectionMutations;
  organizationDomainMutations: OrganizationDomainMutations;
  organizationEnterpriseConnection: OrganizationEnterpriseConnection;
  testRuns: TestRunsView;
  organizationDomains: OrganizationDomainResource[] | undefined;
  onExit?: () => void;
}

interface ConfigureSSOProviderProps {
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  connectionDomains: string[];
  setConnectionDomains: (domains: string[]) => Promise<void>;
  claimedDomains: Map<string, string>;
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
  connectionDomains,
  setConnectionDomains,
  claimedDomains,
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
      connectionDomains,
      setConnectionDomains,
      claimedDomains,
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
      connectionDomains,
      setConnectionDomains,
      claimedDomains,
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
