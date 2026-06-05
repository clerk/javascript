import { __internal_useOrganizationEnterpriseConnectionTestRuns } from '@clerk/shared/react';
import type { EnterpriseConnectionResource, EnterpriseConnectionTestRunResource } from '@clerk/shared/types';
import { useCallback, useState } from 'react';

/**
 * Page size for the paginated test-run list the Test step renders. The success
 * probe is a separate single-row, success-filtered query.
 */
export const TEST_RUNS_PAGE_SIZE = 5;

/**
 * Options for {@link EnterpriseConnectionTestRuns.refresh}.
 */
export interface RefreshTestRunsOptions {
  /**
   * Whether to arm polling for the first record when the list is still empty.
   *
   * The entry/pagination refetch leaves this `false`: landing on the Test step
   * with a freshly-configured, zero-run connection must NOT arm polling merely
   * because the list happens to be empty. Polling is armed only after the user
   * actually kicks off a run, by calling `refresh({ armPolling: true })`.
   *
   * @default false
   */
  armPolling?: boolean;
}

export interface EnterpriseConnectionTestRuns {
  /**
   * Whether the connection has at least one successful test run. Derived from a
   * dedicated success-filtered probe (`status: ['success'], pageSize: 1`), not
   * from the visible page of the list — so it stays correct regardless of which
   * page the table is showing.
   */
  hasSuccessfulTestRun: boolean;
  /**
   * `true` only on the very first load, when there is no data to show yet.
   * Drives the full skeleton: the wizard's global fetch always covers the
   * test-run probe + list, so a cold load that lands on the test step shows the
   * skeleton rather than refetching.
   */
  isLoading: boolean;
  /**
   * `true` whenever a list fetch is in flight, including background refetches
   * that keep the previously-loaded rows visible. Re-entering the test step
   * later drives only the table's loading indicator off this, not the full
   * skeleton.
   */
  isFetching: boolean;
  /**
   * The current page of test runs the table renders.
   */
  rows: EnterpriseConnectionTestRunResource[];
  /**
   * Total number of test runs across all pages, for pagination.
   */
  totalCount: number;
  /**
   * `true` while the list is actively polling for the first record to appear
   * after a freshly created run.
   */
  isPolling: boolean;
  /**
   * The current (1-based) page of the test-run list.
   */
  page: number;
  /**
   * Move the test-run list to a specific page. Owned here, beside the query it
   * drives, so the Test step never spins up a second fetch to paginate.
   */
  setPage: (page: number) => void;
  /**
   * Force a refetch of both the success probe and the visible list page so
   * derived state (e.g. `hasSuccessfulTestRun`) and the table reflect a run that
   * just completed. Keeps the previously-loaded data visible while in flight
   * (`isFetching`).
   *
   * By default this does NOT arm polling — an entry/pagination refetch on an
   * empty list must not start polling on its own. Pass `{ armPolling: true }`
   * after the user kicks off a run so the list polls until the new record lands.
   */
  refresh: (options?: RefreshTestRunsOptions) => Promise<unknown>;
}

/**
 * The single source of enterprise-connection test-run state for the flow.
 *
 * It owns *both* test-run concerns so the Test step never spins up a second
 * fetch:
 *
 * - the **success probe** — "has this connection ever passed a test run?"
 *   (`status: ['success'], pageSize: 1`) → `hasSuccessfulTestRun`;
 * - the **paginated list** the Test step's table renders (`page`, `pageSize`),
 *   along with the page cursor itself.
 *
 * Two distinct loading signals let callers tell a cold first load apart from a
 * background refetch:
 *
 * - `isLoading` — first load only (no data yet), across either query → full
 *   skeleton.
 * - `isFetching` — any in-flight *list* fetch, with previously-loaded rows kept
 *   visible (`keepPreviousData` semantics) → table-level loading on re-entry.
 *
 * `active` gates *both* underlying queries. The umbrella hook keeps it `true`
 * for the existing-connection-at-load case (so test-runs fetch on first load,
 * cover the full skeleton, and drive the `tested` guard) but `false` on the
 * fresh-start path until the user actually lands on the Test step — so merely
 * *creating* a connection mid-flow does not fire a test-runs fetch and flash
 * the global skeleton for a connection that provably has zero runs.
 */
export const useEnterpriseConnectionTestRuns = (
  connection: EnterpriseConnectionResource | undefined,
  active = true,
): EnterpriseConnectionTestRuns => {
  const enterpriseConnectionId = connection?.id ?? null;
  const [page, setPage] = useState(1);

  // Success probe: a single, success-filtered row purely to answer
  // `hasSuccessfulTestRun`. Distinct cache key from the list below, and
  // deliberately *not* `keepPreviousData` — it is a point-in-time fact, not a
  // paginated view.
  const {
    data: successfulTestRuns,
    isLoading: isProbeLoading,
    revalidate: revalidateProbe,
  } = __internal_useOrganizationEnterpriseConnectionTestRuns({
    enterpriseConnectionId,
    params: { initialPage: 1, pageSize: 1, status: ['success'] },
    enabled: active,
  });

  // Paginated list: the rows the Test step's table renders, with polling for a
  // freshly created run to appear. `keepPreviousData` keeps the previous page
  // visible while paginating an existing-at-load list, so a page change surfaces
  // as `isFetching` (table spinner) rather than flipping `isLoading` back to a
  // cold load and tearing the wizard down to a skeleton.
  const {
    data: listData,
    totalCount,
    isLoading: isListLoading,
    isFetching: isListFetching,
    isPolling,
    revalidate: revalidateList,
  } = __internal_useOrganizationEnterpriseConnectionTestRuns({
    enterpriseConnectionId,
    params: { initialPage: page, pageSize: TEST_RUNS_PAGE_SIZE },
    enabled: active,
    keepPreviousData: true,
  });

  const refresh = useCallback(
    (options?: RefreshTestRunsOptions) => {
      const armPolling = options?.armPolling ?? false;
      // The probe is a one-shot fact, never a polling target; only the list
      // refetch carries the polling intent (and only when the caller opts in).
      return Promise.all([revalidateProbe({ armPolling: false }), revalidateList({ armPolling })]);
    },
    [revalidateProbe, revalidateList],
  );

  return {
    hasSuccessfulTestRun: (successfulTestRuns?.length ?? 0) > 0,
    isLoading: isProbeLoading || isListLoading,
    isFetching: isListFetching,
    rows: listData ?? [],
    totalCount: totalCount ?? 0,
    isPolling,
    page,
    setPage,
    refresh,
  };
};
