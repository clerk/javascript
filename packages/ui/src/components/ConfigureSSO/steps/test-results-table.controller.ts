import { useState } from 'react';

import type { TestRunRow } from './test-results-table.model';

export const useTestResultsTableController = (defaultDrawerTitle: string) => {
  const [selectedTestRun, setSelectedTestRun] = useState<TestRunRow | null>(null);
  const drawerTitle =
    selectedTestRun?.status === 'failed'
      ? selectedTestRun.logs?.[0]?.shortMessage || defaultDrawerTitle
      : defaultDrawerTitle;

  return {
    selectedTestRun,
    drawerTitle,
    selectTestRun: setSelectedTestRun,
    onDrawerOpenChange: (open: boolean) => {
      if (!open) {
        setSelectedTestRun(null);
      }
    },
  };
};
