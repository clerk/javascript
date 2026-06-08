import {
  __internal_useOrganizationEnterpriseConnections,
  useOrganization,
  useSession,
  useUser,
} from '@clerk/shared/react';
import type {
  EmailAddressResource,
  EnterpriseConnectionResource,
  EnterpriseConnectionTestRunResource,
  OrganizationResource,
  SignedInSessionResource,
  UserResource,
} from '@clerk/shared/types';
import { useMemo, useRef } from 'react';

import {
  isEnterpriseConnectionConfigured,
  type OrganizationEnterpriseConnection,
  organizationEnterpriseConnection as buildOrganizationEnterpriseConnection,
} from '../domain/organizationEnterpriseConnection';
import {
  type EnterpriseConnectionMutations,
  useEnterpriseConnectionMutations,
} from './useEnterpriseConnectionMutations';
import { type RefreshTestRunsOptions, useEnterpriseConnectionTestRuns } from './useEnterpriseConnectionTestRuns';

export interface UseOrganizationEnterpriseConnectionResult {
  /**
   * Whether the upstream data is still loading. Consumers gate the skeleton on
   * this one level above the provider so the context never observes loading.
   *
   * Test-runs contribute to this only when a connection was present at first
   * load (they're fetched as part of that initial load). On the fresh-start
   * path they stay dormant until the connection is configured, so creating a
   * connection mid-flow never re-flashes the global skeleton.
   */
  isLoading: boolean;
  user: UserResource | null | undefined;
  session: SignedInSessionResource | null | undefined;
  organization: OrganizationResource | null | undefined;
  /**
   * The enterprise connection for the active organization. FAPI currently
   * supports a single enterprise connection per organization.
   */
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  /**
   * The user's primary email address, used to derive the connection name on
   * create. Surfaced here so consumers don't each reach for `useUser`.
   */
  primaryEmailAddress: EmailAddressResource | undefined;
  /**
   * The active organization's SSO-config domain entity — the immutable value
   * object the wizard makes every flow decision from, composing the connection,
   * the admin's email verification, and the test-run fact. Built once here from
   * the raw inputs.
   */
  organizationEnterpriseConnection: OrganizationEnterpriseConnection;
  /**
   * Every connection-domain mutation, pre-wrapped in `useReverification`.
   */
  mutations: EnterpriseConnectionMutations;
  /**
   * The single source of test-run state — the paginated list the Test step
   * renders plus the page cursor and table-level loading. When a connection
   * exists at initial load it's fetched as part of that load, so a cold landing
   * on the test step is covered by the full skeleton; re-entering the step later
   * refetches via {@link TestRunsView.refresh}. On the fresh-start path the
   * queries stay dormant until the connection is configured, after which loading
   * is table-level only.
   */
  testRuns: TestRunsView;
}

/**
 * The Test step's view onto the single test-run source: the visible page of
 * rows, pagination cursor, and table-level loading signals. Lives on the
 * umbrella hook so the step reads it from context instead of issuing its own
 * fetch.
 */
export interface TestRunsView {
  /**
   * The current page of test runs the table renders.
   */
  rows: EnterpriseConnectionTestRunResource[];
  /**
   * Total number of test runs across all pages, for pagination.
   */
  totalCount: number;
  /**
   * `true` only on the cold first load (drives the full skeleton upstream).
   */
  isLoading: boolean;
  /**
   * `true` while a background list refetch is in flight with previous rows kept
   * visible — drives the table spinner on re-entry, never the full skeleton.
   */
  isFetching: boolean;
  /**
   * `true` while polling for a freshly created run to appear.
   */
  isPolling: boolean;
  /**
   * The current (1-based) page.
   */
  page: number;
  /**
   * Move the list to a specific page (drives the single source's fetch).
   */
  setPage: (page: number) => void;
  /**
   * Force a refetch of the visible page (and the success probe), keeping
   * previous rows visible while in flight. By default this does not arm polling;
   * pass `{ armPolling: true }` after the user kicks off a run.
   */
  refresh: (options?: RefreshTestRunsOptions) => Promise<unknown>;
}

/**
 * Umbrella hook for the active organization's enterprise connection. Composes
 * the source query, the domain aggregate, the mutations, and the test-run state
 * into one surface, exposing a single `isLoading` flag so the caller can gate
 * the skeleton above the provider.
 *
 * `__internal_useOrganizationEnterpriseConnections` is the single swappable
 * seam: a future non-org context only swaps this source and everything below
 * stays put.
 */
export const useOrganizationEnterpriseConnection = (): UseOrganizationEnterpriseConnectionResult => {
  const {
    data: enterpriseConnections,
    isLoading: isLoadingEnterpriseConnections,
    createEnterpriseConnection,
    updateEnterpriseConnection,
    deleteEnterpriseConnection,
  } = __internal_useOrganizationEnterpriseConnections({ enabled: true });

  // FAPI currently supports a single enterprise connection per organization.
  const enterpriseConnection = enterpriseConnections?.[0];

  // Whether a connection already existed the first time the source query
  // settled. Captured during render (not in an effect) the first time the query
  // is no longer loading, so it reflects the connection state at *initial load*
  // and is immune to a connection created mid-flow.
  //
  // `undefined` until the first settle; render-phase assignment is safe here —
  // it records a one-time fact about load, it does not sync state to props.
  const hadInitialConnectionRef = useRef<boolean | undefined>(undefined);
  if (hadInitialConnectionRef.current === undefined && !isLoadingEnterpriseConnections) {
    hadInitialConnectionRef.current = Boolean(enterpriseConnection);
  }
  const hadInitialConnection = hadInitialConnectionRef.current === true;

  // The test-runs source is relevant exactly when the connection is configured —
  // the same condition that makes the Test step reachable
  // (`hasMinimumConfiguration || isActive`). Deriving activation straight from
  // the connection drops the imperative activate-on-mount ceremony:
  //   - existing connection at load → configured (or active) → fires on load,
  //     gates the initial skeleton, drives the `tested` guard;
  //   - fresh start with no connection, or a connection created but not yet
  //     configured → dormant, so a mid-flow create does NOT fire the test-runs
  //     queries and flash the global skeleton;
  //   - configure completes (`hasMinimumConfiguration`) → fires, surfacing as
  //     table-level loading because `hadInitialConnection` is false.
  //
  // Computed from the raw connection (not the built entity, which depends on the
  // test-run probe below — reading it here would be circular).
  const testRunsActive =
    isEnterpriseConnectionConfigured(enterpriseConnection) || Boolean(enterpriseConnection?.active);

  const {
    hasSuccessfulTestRun,
    isLoading: isLoadingTestRuns,
    isFetching: isFetchingTestRuns,
    rows: testRunRows,
    totalCount: testRunTotalCount,
    isPolling: isPollingTestRuns,
    page: testRunPage,
    setPage: setTestRunPage,
    refresh: refreshTestRuns,
  } = useEnterpriseConnectionTestRuns(enterpriseConnection, testRunsActive);

  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();

  const primaryEmailAddress = user?.primaryEmailAddress ?? undefined;

  const mutations = useEnterpriseConnectionMutations({
    organization,
    createEnterpriseConnection,
    updateEnterpriseConnection,
    deleteEnterpriseConnection,
  });

  const testRuns = useMemo<TestRunsView>(
    () => ({
      rows: testRunRows,
      totalCount: testRunTotalCount,
      isLoading: isLoadingTestRuns,
      isFetching: isFetchingTestRuns,
      isPolling: isPollingTestRuns,
      page: testRunPage,
      setPage: setTestRunPage,
      refresh: refreshTestRuns,
    }),
    [
      testRunRows,
      testRunTotalCount,
      isLoadingTestRuns,
      isFetchingTestRuns,
      isPollingTestRuns,
      testRunPage,
      setTestRunPage,
      refreshTestRuns,
    ],
  );

  // The email whose domain backs the connection: the primary if present,
  // otherwise the first not-yet-verified address the user is working through.
  const primaryEmail =
    user?.primaryEmailAddress ?? user?.emailAddresses?.find(e => e.verification.status !== 'verified');

  // The single domain entity everything downstream reads decisions from, keyed
  // on the raw inputs so it is only rebuilt when one of them changes.
  const organizationEnterpriseConnection = useMemo<OrganizationEnterpriseConnection>(
    () =>
      buildOrganizationEnterpriseConnection({
        connection: enterpriseConnection,
        primaryEmail,
        hasSuccessfulTestRun,
      }),
    [enterpriseConnection, primaryEmail, hasSuccessfulTestRun],
  );

  return {
    user,
    session,
    organization,
    // Test-runs gate the full skeleton only when a connection was present at
    // first load — that case fetches them as part of the initial load. On the
    // fresh-start path they stay dormant until the connection is configured, and
    // landing on the test step then shows table-level loading, never the global
    // skeleton.
    isLoading: isLoadingEnterpriseConnections || (hadInitialConnection && isLoadingTestRuns),
    enterpriseConnection,
    primaryEmailAddress,
    organizationEnterpriseConnection,
    mutations,
    testRuns,
  };
};
