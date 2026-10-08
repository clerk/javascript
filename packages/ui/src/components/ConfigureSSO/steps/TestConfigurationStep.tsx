import { TEST_RUNS_PAGE_SIZE } from '../hooks/useEnterpriseConnectionTestRuns';
import { ContinueTestSsoStepButton } from './ContinueTestSsoStepButton';
import { OpenTestUrlButton } from './OpenTestUrlButton';
import { useTestConfigurationStepController } from './test-configuration-step.controller';
import { useTestConfigurationStepModel } from './test-configuration-step.model';
import { TestConfigurationStepView } from './test-configuration-step.view';
import { TestResultsTable } from './TestResultsTable';

export const TestConfigurationStep = (): JSX.Element => {
  const model = useTestConfigurationStepModel();
  const controller = useTestConfigurationStepController(model);

  return (
    <TestConfigurationStepView
      error={controller.error}
      goPrev={controller.goPrev}
      showRefreshLogsSpinner={controller.showRefreshLogsSpinner}
      handleRefreshTestRuns={controller.handleRefreshTestRuns}
      openTestUrlButton={<OpenTestUrlButton onTestRunCreated={controller.handleTestRunCreated} />}
      testResultsTable={
        <TestResultsTable
          rows={model.rows}
          isPolling={model.isPolling}
          isLoading={model.isLoading}
          page={model.page}
          pageCount={controller.pageCount}
          pageSize={TEST_RUNS_PAGE_SIZE}
          totalCount={model.totalCount ?? 0}
          onPageChange={model.setPage}
        />
      }
      continueButton={
        <ContinueTestSsoStepButton
          hasSuccessfulTestRun={model.hasSuccessfulTestRun}
          revalidateHasSuccessfulTestRun={model.revalidateHasSuccessfulTestRun}
        />
      }
    />
  );
};
