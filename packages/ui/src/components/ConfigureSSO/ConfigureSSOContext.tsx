import type { EmailAddressResource, EnterpriseConnectionResource } from '@clerk/shared/types';
import React, { type PropsWithChildren } from 'react';

import type { EnterpriseConnectionState } from './domain/enterpriseConnectionState';
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
   * The pure derived-state snapshot the wizard makes every flow decision from,
   * built once upstream by `useOrganizationEnterpriseConnection`. The guards in
   * `ConfigureSSOSteps` and the steps read display gates off this instead of
   * re-deriving from `useUser`/`useSession`.
   */
  connectionState: EnterpriseConnectionState;
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
  /**
   * A monotonically-increasing counter bumped once per reset. The top-level
   * `<Wizard>` is keyed on it, so a bump remounts the wizard and re-derives the
   * furthest-reachable step for the now-no-connection state. Create never bumps
   * it, so the create path keeps using a plain `goNext` (no remount, no flash).
   */
  resetEpoch: number;
  /**
   * Deletes the current connection, then bumps {@link resetEpoch} so the keyed
   * top-level wizard remounts and re-derives the furthest-reachable step. Reads
   * the reverification-wrapped `deleteConnection` mutation off the bundle. A
   * no-op when there is no connection. Reset affordances call this instead of
   * `useWizard().goToStep`, so they work from ANY footer (including nested SAML
   * configure footers) without binding to a nested wizard.
   */
  resetConnection: () => Promise<void>;
}

interface ConfigureSSOProviderProps {
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  /**
   * The pure derived-state snapshot the wizard makes decisions from, built
   * upstream by `useOrganizationEnterpriseConnection`. The provider never
   * derives state itself.
   */
  connectionState: EnterpriseConnectionState;
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
  connectionState,
  testRuns,
  contentRef,
  mutations,
  primaryEmailAddress,
  children,
}: PropsWithChildren<ConfigureSSOProviderProps>): JSX.Element => {
  // Bumped once per reset. The keyed top-level `<Wizard>` remounts on a bump and
  // re-derives the furthest-reachable step for the now-no-connection state.
  const [resetEpoch, setResetEpoch] = React.useState(0);

  const { deleteConnection } = mutations;
  const connectionId = enterpriseConnection?.id;

  const resetConnection = React.useCallback(async () => {
    if (!connectionId) {
      return;
    }
    await deleteConnection(connectionId);
    // The delete revalidates the source, dropping `hasConnection`. Bumping the
    // epoch remounts the keyed wizard, whose `initialState` re-derives the
    // furthest-reachable step (verified email → select-provider; unverified →
    // verify-domain) — never a hardcoded step, never a blank pane.
    setResetEpoch(e => e + 1);
  }, [connectionId, deleteConnection]);

  const value = React.useMemo<ConfigureSSOData>(
    () => ({
      contentRef,
      enterpriseConnection,
      connectionState,
      testRuns,
      mutations,
      primaryEmailAddress,
      resetEpoch,
      resetConnection,
    }),
    [
      contentRef,
      enterpriseConnection,
      mutations,
      connectionState,
      testRuns,
      primaryEmailAddress,
      resetEpoch,
      resetConnection,
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
