import { test } from '@playwright/test';

import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withPattern: ['next.appRouter.withEmailCodes'] })(
  'Content Security Policy @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    test('Clerk loads when nonce is specified', async ({ page }) => {
      const u = createTestUtils({ app, page });
      await u.page.goToRelative('/csp');
      await u.page.getByText('clerk loaded').waitFor({ state: 'visible' });
    });
  },
);
