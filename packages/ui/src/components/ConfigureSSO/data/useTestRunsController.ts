import { __internal_useEnterpriseConnectionTestRuns } from '@clerk/shared/react';
import type { EnterpriseConnectionResource } from '@clerk/shared/types';

export interface TestRunsController {
  /**
   * Whether the connection has at least one successful test run.
   */
  hasSuccessfulTestRun: boolean;
  /**
   * Whether the initial success probe is still loading.
   */
  isLoadingInitial: boolean;
  /**
   * Re-runs the success probe.
   */
  refresh: () => Promise<unknown>;
}

/**
 * Owns the "has this connection ever passed a test run?" probe used to gate the
 * wizard's initial step. This is intentionally narrow: it fetches a single
 * successful run (`status: ['success'], pageSize: 1`) and nothing else.
 *
 * The paginated polling list that the Test step renders stays in that step —
 * this controller is not the place for it.
 */
export const useTestRunsController = (connection: EnterpriseConnectionResource | undefined): TestRunsController => {
  const {
    data: successfulTestRuns,
    isLoading,
    revalidate,
  } = __internal_useEnterpriseConnectionTestRuns({
    enterpriseConnectionId: connection?.id ?? null,
    params: { initialPage: 1, pageSize: 1, status: ['success'] },
  });

  return {
    hasSuccessfulTestRun: (successfulTestRuns?.length ?? 0) > 0,
    isLoadingInitial: isLoading,
    refresh: revalidate,
  };
};
