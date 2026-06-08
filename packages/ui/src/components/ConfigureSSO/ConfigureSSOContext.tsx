import type { EmailAddressResource, EnterpriseConnectionResource } from '@clerk/shared/types';
import React, { type PropsWithChildren } from 'react';

import type { OrganizationEnterpriseConnection } from './domain/organizationEnterpriseConnection';
import type { EnterpriseConnectionMutations } from './hooks/useEnterpriseConnectionMutations';
import type { TestRunsView } from './hooks/useOrganizationEnterpriseConnection';

/**
 * Shared state for the ConfigureSSO wizard, persisted across steps. Everything
 * here is sourced from the umbrella `useOrganizationEnterpriseConnection` hook
 * one level up, so the context never observes a loading state and the steps
 * read display gates / mutations from a single place instead of re-deriving.
 */
export interface ConfigureSSOData {
  /**
   * The enterprise connection from the user's primary email address domain.
   */
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  /**
   * Ref to the scrollable content container of the wizard.
   */
  contentRef: React.RefObject<HTMLDivElement>;
  /**
   * Every connection-domain mutation the wizard performs, pre-wrapped in
   * `useReverification`. Steps read these from context instead of wrapping
   * inline or prop-drilling raw mutation handles.
   */
  mutations: EnterpriseConnectionMutations;
  /**
   * The active organization's SSO-config domain entity the wizard makes every
   * flow decision from, built once upstream by
   * `useOrganizationEnterpriseConnection`. The guards in `ConfigureSSOSteps` and
   * the steps read display gates off this instead of re-deriving from
   * `useUser`/`useSession`.
   */
  organizationEnterpriseConnection: OrganizationEnterpriseConnection;
  /**
   * The single source of test-run state — the paginated list, page cursor, and
   * table-level loading — owned by `useOrganizationEnterpriseConnection`. The
   * Test step reads its table off this instead of issuing its own fetch.
   */
  testRuns: TestRunsView;
  /**
   * The user's primary email address, fetched once upstream by
   * `useOrganizationEnterpriseConnection`. Threaded through so the steps can
   * derive the connection name without each calling `useUser` itself.
   */
  primaryEmailAddress: EmailAddressResource | undefined;
}

interface ConfigureSSOProviderProps {
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  /**
   * The active organization's SSO-config domain entity the wizard makes
   * decisions from, built upstream by `useOrganizationEnterpriseConnection`. The
   * provider never builds the entity itself.
   */
  organizationEnterpriseConnection: OrganizationEnterpriseConnection;
  /**
   * The single test-run source (list + page + table loading) owned by
   * `useOrganizationEnterpriseConnection`.
   */
  testRuns: TestRunsView;
  contentRef: React.RefObject<HTMLDivElement>;
  /**
   * The bundle of reverification-wrapped connection mutations, built upstream by
   * `useOrganizationEnterpriseConnection`.
   */
  mutations: EnterpriseConnectionMutations;
  /**
   * The user's primary email address, fetched once upstream by
   * `useOrganizationEnterpriseConnection`.
   */
  primaryEmailAddress: EmailAddressResource | undefined;
}

const ConfigureSSOContext = React.createContext<ConfigureSSOData | null>(null);
ConfigureSSOContext.displayName = 'ConfigureSSOContext';

export const ConfigureSSOProvider = ({
  enterpriseConnection,
  organizationEnterpriseConnection,
  testRuns,
  contentRef,
  mutations,
  primaryEmailAddress,
  children,
}: PropsWithChildren<ConfigureSSOProviderProps>): JSX.Element => {
  const value = React.useMemo<ConfigureSSOData>(
    () => ({
      contentRef,
      enterpriseConnection,
      organizationEnterpriseConnection,
      testRuns,
      mutations,
      primaryEmailAddress,
    }),
    [contentRef, enterpriseConnection, mutations, organizationEnterpriseConnection, testRuns, primaryEmailAddress],
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
