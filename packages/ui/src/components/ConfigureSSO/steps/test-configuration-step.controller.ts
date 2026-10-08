import { useCardState } from '@/elements/contexts';
import { useSpinDelay } from '@/hooks';

import { useWizard } from '../elements/Wizard';
import { TEST_RUNS_PAGE_SIZE } from '../hooks/useEnterpriseConnectionTestRuns';
import type { useTestConfigurationStepModel } from './test-configuration-step.model';

type Model = ReturnType<typeof useTestConfigurationStepModel>;

export const useTestConfigurationStepController = (model: Model) => {
  const { goPrev } = useWizard();
  const card = useCardState();
  const isRefreshingTestRuns = model.isFetching && !model.isLoading;
  const showRefreshLogsSpinner = useSpinDelay(isRefreshingTestRuns);
  const pageCount = model.totalCount ? Math.ceil(model.totalCount / TEST_RUNS_PAGE_SIZE) : 0;

  const handleTestRunCreated = () => {
    model.setPage(1);
    // Refetch the single source and ARM polling: the list refetch starts the
    // empty→first-row poll (self-cancels the instant a row lands) so the new run
    // surfaces on its own, and the success probe refresh keeps the derived
    // `hasSuccessfulTestRun` / Continue gate in sync once the run completes. The
    // "Refresh logs" button stays a one-shot refresh (no arm) — a manual refresh
    // must not start a perpetual poll.
    void model.refresh({ armPolling: true });
  };

  const handleRefreshTestRuns = () => {
    void model.refresh();
  };

  return {
    error: card.error,
    goPrev,
    showRefreshLogsSpinner,
    pageCount,
    handleTestRunCreated,
    handleRefreshTestRuns,
  };
};
