import { setupClerkTestingToken } from '../../setupClerkTestingToken';
import type { EnhancedPage } from './app';

export const createTestingTokenPageObject = ({ page }: { page: EnhancedPage }) => {
  return {
    setup: async () => setupClerkTestingToken({ page }),
  };
};
