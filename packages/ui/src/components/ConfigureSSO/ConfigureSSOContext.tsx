import React, { type PropsWithChildren } from 'react';

import type {
  SSOConnection,
  SSOConnectionCommands,
  SSODomain,
  SSODomainCommands,
  SSOTestRuns,
} from './configure-sso.types';
import type { OrganizationEnterpriseConnection } from './domain/organizationEnterpriseConnection';

/**
 * Shared state for the ConfigureSSO wizard, persisted across steps. Connection
 * state is sourced from the umbrella `useOrganizationEnterpriseConnection` hook
 * one level up, so the context never observes a loading state and the steps read
 * display gates / mutations from a single place instead of re-deriving.
 */
export interface ConfigureSSOData {
  ownerKey: string;
  canRun: () => boolean;
  enterpriseConnection: SSOConnection | undefined;
  /** The scoped connection's domains, a draft while the scope is `new`. */
  connectionDomains: string[];
  setConnectionDomains: (domains: string[]) => Promise<void>;
  /** Domains other connections of the organization authenticate, keyed to that connection's name. */
  claimedDomains: Map<string, string>;
  /** Ref to the wizard's scrollable content container. */
  contentRef: React.RefObject<HTMLDivElement>;
  enterpriseConnectionMutations: SSOConnectionCommands;
  organizationDomainMutations: SSODomainCommands;
  organizationEnterpriseConnection: OrganizationEnterpriseConnection;
  testRuns: SSOTestRuns;
  organizationDomains: SSODomain[] | undefined;
  onExit?: () => void;
}

export type ConfigureSSOProviderProps = ConfigureSSOData;

const ConfigureSSOContext = React.createContext<ConfigureSSOData | null>(null);
ConfigureSSOContext.displayName = 'ConfigureSSOContext';

export const ConfigureSSOProvider = ({
  ownerKey,
  canRun,
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
      ownerKey,
      canRun,
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
      ownerKey,
      canRun,
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
