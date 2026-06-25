import {
  __internal_useOrganizationDomains,
  __internal_useOrganizationEnterpriseConnections,
  useOrganization,
  useSession,
  useUser,
} from '@clerk/shared/react';
import type {
  DeletedObjectResource,
  EnterpriseConnectionResource,
  EnterpriseConnectionTestRunInitResource,
  EnterpriseConnectionTestRunResource,
  OrganizationDomainResource,
  OrganizationDomainsBulkOwnershipVerificationResource,
  OrganizationResource,
  SignedInSessionResource,
  UpdateOrganizationEnterpriseConnectionParams,
  UserResource,
} from '@clerk/shared/types';
import { useCallback, useMemo, useRef } from 'react';

import {
  organizationEnterpriseConnection as buildOrganizationEnterpriseConnection,
  isEnterpriseConnectionConfigured,
  type OrganizationEnterpriseConnection,
} from '../domain/organizationEnterpriseConnection';
import type { ProviderType } from '../types';
import { type RefreshTestRunsOptions, useEnterpriseConnectionTestRuns } from './useEnterpriseConnectionTestRuns';

/**
 * The full set of enterprise-connection mutations.
 *
 * The org-scoped enterprise-connection FAPI endpoints carry no
 * `EnsureReverification` middleware (that lived on the old `/me` scope), so
 * `session_reverification_required` never fires here and these writes call the
 * underlying handles directly — no `useReverification` wrapping.
 *
 * This surface is intentionally connection-domain only: it carries no wizard,
 * step, or navigation concepts, so it can be lifted into a reusable hook for
 * custom self-serve SSO flows.
 */
export interface EnterpriseConnectionMutations {
  /**
   * Creates a new enterprise connection for the active organization. The
   * verified organization domains are sourced from the hook itself, so callers
   * never thread them through.
   */
  createConnection: (provider: ProviderType) => Promise<EnterpriseConnectionResource | undefined>;
  /**
   * Swaps the active organization's connection to a different provider. This removes the existing
   * connection and creates a fresh one.
   */
  changeProvider: (provider: ProviderType) => Promise<EnterpriseConnectionResource | undefined>;
  updateConnection: (
    id: string,
    params: UpdateOrganizationEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource | undefined>;
  setConnectionActive: (id: string, active: boolean) => Promise<EnterpriseConnectionResource | undefined>;
  deleteConnection: (id: string) => Promise<DeletedObjectResource | undefined>;
  /** Resolves with the test-run URL to open. */
  createTestRun: (id: string) => Promise<EnterpriseConnectionTestRunInitResource>;
}

export interface OrganizationDomainMutations {
  createDomain: (name: string) => Promise<OrganizationDomainResource | undefined>;
  prepareOwnershipVerification: (
    domains: OrganizationDomainResource[],
  ) => Promise<OrganizationDomainsBulkOwnershipVerificationResource | undefined>;
  attemptOwnershipVerification: (
    domains: OrganizationDomainResource[],
  ) => Promise<OrganizationDomainsBulkOwnershipVerificationResource | undefined>;
  revalidate: () => Promise<void>;
}

export interface UseOrganizationEnterpriseConnectionResult {
  /**
   * Consumers gate the skeleton on this ONE level above the provider so the
   * context never observes loading. Test-runs contribute only when a connection
   * was present at first load; on the fresh-start path they stay dormant until
   * configured, so a mid-flow create never re-flashes the global skeleton.
   */
  isLoading: boolean;
  user: UserResource | null | undefined;
  session: SignedInSessionResource | null | undefined;
  organization: OrganizationResource | null | undefined;
  /** FAPI currently supports a single connection per organization. */
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  /** The domain entity the wizard makes every flow decision from. */
  organizationEnterpriseConnection: OrganizationEnterpriseConnection;
  enterpriseConnectionMutations: EnterpriseConnectionMutations;
  testRuns: TestRunsView;
  organizationDomains: OrganizationDomainResource[] | undefined;
  organizationDomainMutations: OrganizationDomainMutations;
}

/**
 * The Test step's view onto the single test-run source. Lives on the umbrella
 * hook so the step reads it from context instead of issuing its own fetch.
 */
export interface TestRunsView {
  rows: EnterpriseConnectionTestRunResource[];
  totalCount: number;
  /** Cold first load only → drives the full skeleton upstream. */
  isLoading: boolean;
  /** Background list refetch with prior rows kept → table spinner, not skeleton. */
  isFetching: boolean;
  isPolling: boolean;
  page: number;
  setPage: (page: number) => void;
  /** Pass `{ armPolling: true }` after the user kicks off a run. */
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

  const handleDomainOwnershipVerified = useCallback(
    async (verifiedDomains: OrganizationDomainResource[]) => {
      if (!enterpriseConnection) {
        return;
      }

      const verifiedDomainNames = verifiedDomains.map(domain => domain.name);
      const domains = Array.from(new Set([...(enterpriseConnection.domains ?? []), ...verifiedDomainNames]));
      const hasNewDomains = domains.length !== (enterpriseConnection.domains?.length ?? 0);
      if (!hasNewDomains) {
        return;
      }

      await updateEnterpriseConnection(enterpriseConnection.id, { domains });
    },
    [enterpriseConnection, updateEnterpriseConnection],
  );

  const {
    isLoading: isLoadingOrganizationDomains,
    data: organizationDomains,
    createDomain,
    prepareOwnershipVerification,
    attemptOwnershipVerification,
    revalidate: revalidateDomains,
  } = __internal_useOrganizationDomains({
    enrollmentMode: 'enterprise_sso',
    onOwnershipVerified: handleDomainOwnershipVerified,
  });

  const organizationDomainMutations = useMemo<OrganizationDomainMutations>(
    () => ({
      createDomain,
      prepareOwnershipVerification,
      attemptOwnershipVerification,
      revalidate: revalidateDomains,
    }),
    [createDomain, prepareOwnershipVerification, attemptOwnershipVerification, revalidateDomains],
  );

  const enterpriseConnectionMutations = useMemo<EnterpriseConnectionMutations>(() => {
    const createConnection: EnterpriseConnectionMutations['createConnection'] = provider => {
      return createEnterpriseConnection({
        provider,
        domains: organizationDomains?.map(domain => domain.name),
      });
    };

    const changeProvider: EnterpriseConnectionMutations['changeProvider'] = async provider => {
      // FAPI can't switch an existing connection's provider in place, so for the MVP
      // we delete the old connection and create a new one. This is intentionally
      // non-atomic: if the create fails, the org is briefly left without a connection
      // until the user retries. Recovery is by design — the next render revalidates
      // the now-deleted connection away, so a retry is just a plain create.
      if (enterpriseConnection) {
        await deleteEnterpriseConnection(enterpriseConnection.id);
      }

      const domains = enterpriseConnection?.domains ?? organizationDomains?.map(domain => domain.name);

      return createEnterpriseConnection({
        provider,
        domains,
      });
    };

    const updateConnection: EnterpriseConnectionMutations['updateConnection'] = (id, params) =>
      updateEnterpriseConnection(id, params);

    const setConnectionActive: EnterpriseConnectionMutations['setConnectionActive'] = (id, active) =>
      updateEnterpriseConnection(id, { active });

    const deleteConnection: EnterpriseConnectionMutations['deleteConnection'] = id => deleteEnterpriseConnection(id);

    const createTestRun: EnterpriseConnectionMutations['createTestRun'] = id => {
      // The flow never reaches the test step without an active organization;
      // guard so the fetcher stays well-typed without leaking an `undefined`
      // organization.
      if (!organization) {
        throw new Error(
          'useOrganizationEnterpriseConnection.createTestRun called before the organization resource was loaded.',
        );
      }
      return organization.createEnterpriseConnectionTestRun(id);
    };

    return {
      createConnection,
      changeProvider,
      updateConnection,
      setConnectionActive,
      deleteConnection,
      createTestRun,
    };
  }, [
    user,
    organization,
    organizationDomains,
    enterpriseConnection,
    createEnterpriseConnection,
    updateEnterpriseConnection,
    deleteEnterpriseConnection,
  ]);

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

  // The single domain entity everything downstream reads decisions from, keyed
  // on the raw inputs so it is only rebuilt when one of them changes.
  const organizationEnterpriseConnection = useMemo<OrganizationEnterpriseConnection>(
    () =>
      buildOrganizationEnterpriseConnection({
        connection: enterpriseConnection,
        hasSuccessfulTestRun,
      }),
    [enterpriseConnection, hasSuccessfulTestRun],
  );

  return {
    user,
    session,
    organization,
    // Test-runs gate the full skeleton only when a connection was present at
    // first load — that case fetches them as part of the initial load. On the
    // fresh-start path they stay dormant until the connection is configured, and
    // landing on the test step then shows table-level loading, never the global
    isLoading:
      isLoadingEnterpriseConnections || isLoadingOrganizationDomains || (hadInitialConnection && isLoadingTestRuns),
    enterpriseConnection,
    organizationEnterpriseConnection,
    enterpriseConnectionMutations,
    testRuns,
    organizationDomains,
    organizationDomainMutations,
  };
};
