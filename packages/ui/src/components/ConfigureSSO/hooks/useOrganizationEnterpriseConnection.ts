import {
  __internal_useOrganizationDomains,
  __internal_useOrganizationEnterpriseConnections,
  useClerk,
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
  UpdateOrganizationEnterpriseConnectionParams,
} from '@clerk/shared/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ConnectionScope } from '../domain/connectionScope';
import {
  defaultConnectionDomains,
  domainsClaimedByOtherConnections,
  isEnterpriseConnectionConfigured,
  type OrganizationEnterpriseConnection,
  organizationEnterpriseConnection as buildOrganizationEnterpriseConnection,
  sortEnterpriseConnections,
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
   * Creates a new enterprise connection for the active organization with the
   * domains held in [UseOrganizationEnterpriseConnectionResult.connectionDomains],
   * so callers never thread them through.
   */
  createConnection: (provider: ProviderType) => Promise<EnterpriseConnectionResource | undefined>;
  /** Replaces the connection `id` with a fresh one for `provider`. */
  changeProvider: (id: string, provider: ProviderType) => Promise<EnterpriseConnectionResource | undefined>;
  updateConnection: (
    id: string,
    params: UpdateOrganizationEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource | undefined>;
  setConnectionActive: (id: string, active: boolean) => Promise<EnterpriseConnectionResource | undefined>;
  deleteConnection: (id: string) => Promise<DeletedObjectResource | undefined>;
  /** Resolves with the test-run URL to open. */
  createTestRun: (id: string) => Promise<EnterpriseConnectionTestRunInitResource | undefined>;
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
  canRun: () => boolean;
  ownerKey: string;
  organization: OrganizationResource | null | undefined;
  /** Every connection of the organization, in deterministic order. */
  enterpriseConnections: EnterpriseConnectionResource[];
  /** Which connection the wizard is editing. */
  connectionScope: ConnectionScope;
  selectConnection: (scope: ConnectionScope) => void;
  /** The scoped connection, `undefined` while the scope is `new`. */
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  /**
   * The domains the scoped connection authenticates. An existing connection
   * reads them off the resource; a `new` scope keeps a draft until the create,
   * seeded with every verified organization domain no other connection claims.
   */
  connectionDomains: string[];
  /** Replaces [connectionDomains]: an update for an existing connection, a draft edit for a `new` scope. */
  setConnectionDomains: (domains: string[]) => Promise<void>;
  /** Domains other connections of the organization already authenticate, keyed to that connection's name. */
  claimedDomains: Map<string, string>;
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
  /**
   * Revalidates the success probe and resolves with the fresh answer, so the
   * Test step's Continue gate can pick up a run completed elsewhere on demand.
   */
  revalidateHasSuccessfulTestRun: () => Promise<boolean>;
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
export const useOrganizationEnterpriseConnection = ({
  manage = true,
}: { manage?: boolean } = {}): UseOrganizationEnterpriseConnectionResult => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const organizationId = organization?.id;
  const ownerKey = JSON.stringify([actor, sessionId, clientId, organizationId]);
  const owner = useRef({ key: ownerKey, version: 0 });
  const mounted = useRef(true);
  const selectionVersion = useRef(0);
  if (owner.current.key !== ownerKey) {
    owner.current = { key: ownerKey, version: owner.current.version + 1 };
  }
  const version = owner.current.version;
  const canRun = useCallback(
    () =>
      mounted.current &&
      owner.current.version === version &&
      Boolean(actor && organizationId) &&
      clerk.user?.id === actor &&
      clerk.session?.id === sessionId &&
      clerk.client?.id === clientId &&
      clerk.organization?.id === organizationId,
    [clerk, actor, sessionId, clientId, organizationId, version],
  );
  const runOwnedRequest = useCallback(
    async <T>(request: () => Promise<T>, isCurrent = canRun): Promise<T | undefined> => {
      if (!isCurrent()) {
        return;
      }
      try {
        const result = await request();
        return isCurrent() ? result : undefined;
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
      }
    },
    [canRun],
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const {
    data: sourceConnections,
    isLoading: isLoadingEnterpriseConnections,
    createEnterpriseConnection,
    updateEnterpriseConnection,
    deleteEnterpriseConnection,
  } = __internal_useOrganizationEnterpriseConnections({ enabled: true, keepPreviousData: false });

  const enterpriseConnections = useMemo(() => sortEnterpriseConnections(sourceConnections ?? []), [sourceConnections]);

  // `null` resolves to the first connection so the standalone host, which has no list UI, still edits a deterministic one.
  const [selection, setSelection] = useState<{
    ownerVersion: number;
    requestedScope: ConnectionScope | null;
    draftDomains: string[] | null;
  }>({ ownerVersion: version, requestedScope: null, draftDomains: null });
  const requestedScope = selection.ownerVersion === version ? selection.requestedScope : null;
  // The `new` scope's domains until the create lands; `null` means the admin has not touched the default yet.
  const draftDomains = selection.ownerVersion === version ? selection.draftDomains : null;
  const setDraftDomains = useCallback(
    (domains: string[]) => {
      if (canRun()) {
        setSelection(current => ({
          ownerVersion: version,
          requestedScope: current.ownerVersion === version ? current.requestedScope : null,
          draftDomains: [...domains],
        }));
      }
    },
    [version, canRun],
  );

  const setScope = useCallback(
    (next: ConnectionScope | null) => {
      if (canRun()) {
        selectionVersion.current++;
        setSelection({ ownerVersion: version, requestedScope: next, draftDomains: null });
      }
    },
    [canRun, version],
  );

  const connectionScope = useMemo<ConnectionScope>(
    () =>
      requestedScope ??
      (enterpriseConnections[0] ? { kind: 'existing', id: enterpriseConnections[0].id } : { kind: 'new' }),
    [requestedScope, enterpriseConnections],
  );

  const enterpriseConnection =
    connectionScope.kind === 'existing'
      ? enterpriseConnections.find(connection => connection.id === connectionScope.id)
      : undefined;

  const selectConnection = useCallback((next: ConnectionScope) => setScope(next), [setScope]);

  // Whether the scoped connection already existed the first time the source
  // query settled. Captured during render (not in an effect) the first time the
  // query is no longer loading, so it reflects the connection state at *initial
  // load* and is immune to a connection created mid-flow.
  //
  // `undefined` until the first settle; render-phase assignment is safe here —
  // it records a one-time fact about load, it does not sync state to props.
  const hadInitialConnectionRef = useRef<{ ownerKey: string; value: boolean | undefined }>({
    ownerKey,
    value: undefined,
  });
  if (hadInitialConnectionRef.current.ownerKey !== ownerKey) {
    hadInitialConnectionRef.current = { ownerKey, value: undefined };
  }
  if (hadInitialConnectionRef.current.value === undefined && !isLoadingEnterpriseConnections) {
    hadInitialConnectionRef.current.value = Boolean(enterpriseConnection);
  }
  const hadInitialConnection = hadInitialConnectionRef.current.value === true;

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
    revalidateHasSuccessfulTestRun,
  } = useEnterpriseConnectionTestRuns(enterpriseConnection, testRunsActive && manage, ownerKey);

  const resolvedScopeKey = JSON.stringify([
    connectionScope.kind,
    connectionScope.kind === 'existing' ? connectionScope.id : null,
    enterpriseConnection?.id,
  ]);
  const resolvedScope = useRef({ key: resolvedScopeKey, version: 0 });
  if (resolvedScope.current.key !== resolvedScopeKey) {
    resolvedScope.current = { key: resolvedScopeKey, version: resolvedScope.current.version + 1 };
  }
  const resolvedScopeVersion = resolvedScope.current.version;
  const currentSelectionVersion = selectionVersion.current;
  const canRunSelection = useCallback(
    () =>
      canRun() &&
      selectionVersion.current === currentSelectionVersion &&
      resolvedScope.current.version === resolvedScopeVersion,
    [canRun, currentSelectionVersion, resolvedScopeVersion],
  );

  const claimedDomains = useMemo(
    () => domainsClaimedByOtherConnections(enterpriseConnections, enterpriseConnection?.id),
    [enterpriseConnections, enterpriseConnection],
  );

  // A domain verified from this wizard joins the scoped connection on its own;
  // one another connection claims stays out, since FAPI would reject it.
  const handleDomainOwnershipVerified = useCallback(
    async (verifiedDomains: OrganizationDomainResource[]) => {
      if (!canRunSelection()) {
        return;
      }
      const current = enterpriseConnection ? (enterpriseConnection.domains ?? []) : draftDomains;
      if (current === null) {
        return;
      }

      const domains = Array.from(
        new Set([...current, ...verifiedDomains.map(domain => domain.name).filter(name => !claimedDomains.has(name))]),
      );
      if (domains.length === current.length) {
        return;
      }

      if (enterpriseConnection) {
        await runOwnedRequest(() => updateEnterpriseConnection(enterpriseConnection.id, { domains }), canRunSelection);
      } else {
        setDraftDomains(domains);
      }
    },
    [
      enterpriseConnection,
      draftDomains,
      claimedDomains,
      updateEnterpriseConnection,
      canRunSelection,
      setDraftDomains,
      runOwnedRequest,
    ],
  );

  const {
    isLoading: isLoadingOrganizationDomains,
    data: organizationDomains,
    createDomain,
    prepareOwnershipVerification,
    attemptOwnershipVerification,
    revalidate: revalidateDomains,
  } = __internal_useOrganizationDomains({
    enabled: manage,
    keepPreviousData: false,
    enrollmentMode: 'enterprise_sso',
    onOwnershipVerified: handleDomainOwnershipVerified,
  });

  const connectionDomains = useMemo<string[]>(
    () =>
      enterpriseConnection
        ? (enterpriseConnection.domains ?? [])
        : (draftDomains ?? defaultConnectionDomains(organizationDomains, claimedDomains)),
    [enterpriseConnection, draftDomains, organizationDomains, claimedDomains],
  );

  const setConnectionDomains = useCallback(
    async (domains: string[]) => {
      if (!canRunSelection()) {
        return;
      }
      if (enterpriseConnection) {
        await runOwnedRequest(() => updateEnterpriseConnection(enterpriseConnection.id, { domains }), canRunSelection);
      } else {
        setDraftDomains(domains);
      }
    },
    [enterpriseConnection, updateEnterpriseConnection, canRunSelection, setDraftDomains, runOwnedRequest],
  );

  const organizationDomainMutations = useMemo<OrganizationDomainMutations>(
    () => ({
      createDomain: name => runOwnedRequest(() => createDomain(name)),
      prepareOwnershipVerification: domains => runOwnedRequest(() => prepareOwnershipVerification(domains)),
      attemptOwnershipVerification: domains => runOwnedRequest(() => attemptOwnershipVerification(domains)),
      revalidate: async () => {
        if (canRun()) {
          await runOwnedRequest(revalidateDomains);
        }
      },
    }),
    [
      createDomain,
      prepareOwnershipVerification,
      attemptOwnershipVerification,
      revalidateDomains,
      canRun,
      runOwnedRequest,
    ],
  );

  const enterpriseConnectionMutations = useMemo<EnterpriseConnectionMutations>(() => {
    const createConnection: EnterpriseConnectionMutations['createConnection'] = async provider => {
      if (!canRun()) {
        return;
      }
      const selectedVersion = selectionVersion.current;
      const created = await runOwnedRequest(() => createEnterpriseConnection({ provider, domains: connectionDomains }));

      if (!canRun()) {
        return;
      }
      if (created && selectionVersion.current === selectedVersion) {
        setScope({ kind: 'existing', id: created.id });
      }

      return created;
    };

    const changeProvider: EnterpriseConnectionMutations['changeProvider'] = async (id, provider) => {
      if (!canRun()) {
        return;
      }
      const selectedVersion = selectionVersion.current;
      // FAPI can't switch a connection's provider in place, so this deletes then
      // recreates. Intentionally non-atomic: a failed create leaves the org one
      // connection short until the user retries, which is then a plain create.
      const replaced = enterpriseConnections.find(connection => connection.id === id);
      await runOwnedRequest(() => deleteEnterpriseConnection(id));
      if (!canRun()) {
        return;
      }

      const created = await runOwnedRequest(() =>
        createEnterpriseConnection({ provider, domains: replaced?.domains ?? connectionDomains }),
      );

      if (!canRun()) {
        return;
      }
      if (created && selectionVersion.current === selectedVersion) {
        setScope({ kind: 'existing', id: created.id });
      }

      return created;
    };

    const updateConnection: EnterpriseConnectionMutations['updateConnection'] = (id, params) =>
      runOwnedRequest(() => updateEnterpriseConnection(id, params));

    const setConnectionActive: EnterpriseConnectionMutations['setConnectionActive'] = (id, active) =>
      runOwnedRequest(() => updateEnterpriseConnection(id, { active }));

    const deleteConnection: EnterpriseConnectionMutations['deleteConnection'] = async id => {
      if (!canRun()) {
        return;
      }
      const selectedVersion = selectionVersion.current;
      const deleted = await runOwnedRequest(() => deleteEnterpriseConnection(id));

      // Pin to `new` rather than `null`, or the wizard would reseat onto a connection the user never chose.
      if (!canRun()) {
        return;
      }
      if (
        selectionVersion.current === selectedVersion &&
        connectionScope.kind === 'existing' &&
        connectionScope.id === id
      ) {
        setScope({ kind: 'new' });
      }

      return deleted;
    };

    const createTestRun: EnterpriseConnectionMutations['createTestRun'] = async id => {
      // The flow never reaches the test step without an active organization;
      // guard so the fetcher stays well-typed without leaking an `undefined`
      // organization.
      if (!canRun()) {
        return;
      }
      const currentOrganization = clerk.organization;
      if (!currentOrganization) {
        return;
      }
      return runOwnedRequest(() => currentOrganization.createEnterpriseConnectionTestRun(id));
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
    clerk,
    canRun,
    runOwnedRequest,
    connectionDomains,
    enterpriseConnections,
    connectionScope,
    setScope,
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
      setPage: page => {
        if (canRunSelection()) {
          setTestRunPage(page);
        }
      },
      refresh: async options => {
        if (!canRunSelection()) {
          return;
        }
        const result = await runOwnedRequest(() => refreshTestRuns(options), canRunSelection);
        return canRunSelection() ? result : undefined;
      },
      revalidateHasSuccessfulTestRun: async () => {
        if (!canRunSelection()) {
          return false;
        }
        const result = await runOwnedRequest(revalidateHasSuccessfulTestRun, canRunSelection);
        return canRunSelection() && Boolean(result);
      },
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
      revalidateHasSuccessfulTestRun,
      canRunSelection,
      runOwnedRequest,
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
    canRun,
    ownerKey,
    organization,
    // Test-runs gate the full skeleton only when a connection was present at
    // first load — that case fetches them as part of the initial load. On the
    // fresh-start path they stay dormant until the connection is configured, and
    // landing on the test step then shows table-level loading, never the global
    isLoading:
      isLoadingEnterpriseConnections || isLoadingOrganizationDomains || (hadInitialConnection && isLoadingTestRuns),
    enterpriseConnections,
    connectionScope,
    selectConnection,
    enterpriseConnection,
    connectionDomains,
    setConnectionDomains,
    claimedDomains,
    organizationEnterpriseConnection,
    enterpriseConnectionMutations,
    testRuns,
    organizationDomains,
    organizationDomainMutations,
  };
};
