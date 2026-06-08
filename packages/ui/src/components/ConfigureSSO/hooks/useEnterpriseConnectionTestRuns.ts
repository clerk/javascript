import { __internal_useOrganizationEnterpriseConnectionTestRuns } from '@clerk/shared/react';
import type { EnterpriseConnectionResource, EnterpriseConnectionTestRunResource } from '@clerk/shared/types';
import { useCallback, useState } from 'react';

/** Page size for the paginated list; the success probe is a separate query. */
export const TEST_RUNS_PAGE_SIZE = 5;

export interface RefreshTestRunsOptions {
  /**
   * Arm polling for the first record while the list is still empty. The
   * entry/pagination refetch leaves this `false`: landing on the Test step with
   * a freshly-configured, zero-run connection must NOT arm polling merely
   * because the list is empty. Only the user kicking off a run sets it `true`.
   *
   * @default false
   */
  armPolling?: boolean;
}

export interface EnterpriseConnectionTestRuns {
  /**
   * Derived from a dedicated success-filtered probe (`status: ['success'],
   * pageSize: 1`), NOT the visible list page — so it stays correct regardless of
   * which page the table shows.
   */
  hasSuccessfulTestRun: boolean;
  /** First load only (no data yet) → drives the full skeleton. */
  isLoading: boolean;
  /**
   * Any list fetch in flight, including background refetches that keep prior
   * rows visible → drives only the table loading indicator, not the skeleton.
   */
  isFetching: boolean;
  rows: EnterpriseConnectionTestRunResource[];
  totalCount: number;
  isPolling: boolean;
  page: number;
  setPage: (page: number) => void;
  /**
   * Refetches both the success probe and the visible list page, keeping prior
   * data visible while in flight (`isFetching`). Does NOT arm polling by default
   * — an entry/pagination refetch on an empty list must not start polling on its
   * own. Pass `{ armPolling: true }` after the user kicks off a run.
   */
  refresh: (options?: RefreshTestRunsOptions) => Promise<unknown>;
}

/**
 * The single source of test-run state. Owns BOTH test-run concerns so the Test
 * step never issues its own fetch:
 *
 * - the **success probe** (`status: ['success'], pageSize: 1`) →
 *   `hasSuccessfulTestRun`;
 * - the **paginated list** the table renders, plus the page cursor.
 *
 * Two loading signals separate a cold load from a background refetch: `isLoading`
 * (first load only → full skeleton) vs `isFetching` (any in-flight LIST fetch
 * with prior rows kept via `keepPreviousData` → table-level loading on re-entry).
 *
 * `active` gates BOTH queries. The umbrella hook derives it from the connection
 * — `true` once configured (or active), which is also when the Test step becomes
 * reachable. So an existing configured connection fetches on first load (covering
 * the skeleton + the `tested` guard), while a merely-created-not-yet-configured
 * connection stays `false`, never flashing the global skeleton for zero runs.
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
