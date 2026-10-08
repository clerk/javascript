import type { SSOTestRun } from '../configure-sso.types';
import { useTestResultsTableController } from './test-results-table.controller';
import { useTestResultsTableModel } from './test-results-table.model';
import { TestResultsTableView } from './test-results-table.view';

type TestResultsTableProps = {
  rows: SSOTestRun[];
  isLoading: boolean;
  isPolling: boolean;
  page: number;
  pageCount: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export const TestResultsTable = (props: TestResultsTableProps): JSX.Element => {
  const model = useTestResultsTableModel(props.rows);
  const controller = useTestResultsTableController(model.defaultDrawerTitle);
  return (
    <TestResultsTableView
      {...props}
      {...model}
      {...controller}
    />
  );
};
