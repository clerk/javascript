import type { PlaywrightSetupClerkTestingTokenOptions } from '../../setupClerkTestingToken';
import { setupClerkTestingToken } from '../../setupClerkTestingToken';
import type { EnhancedPage } from './app';

export const createTestingTokenPageObject = ({
  page,
  testingTokenOptions,
}: {
  page: EnhancedPage;
  testingTokenOptions?: PlaywrightSetupClerkTestingTokenOptions;
}) => {
  return {
    setup: async () => setupClerkTestingToken({ page, options: testingTokenOptions }),
  };
};
