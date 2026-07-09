import { test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import {
  testClaimedAppWithMissingKeys,
  testKeylessRemovedAfterEnvAndRestart,
  testToggleCollapsePopoverAndClaim,
} from '../../testUtils/keylessHelpers';

const commonSetup = appConfigs.nuxt.node.clone();

test.describe('Keyless mode @nuxt', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(90_000);

  test.use({
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '',
    },
  });

  let app: Application;
  let dashboardUrl = 'https://dashboard.clerk.com/';

  test.beforeAll(async () => {
    app = await commonSetup.commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withKeyless);
    if (appConfigs.envs.withKeyless.privateVariables.get('CLERK_API_URL')?.includes('clerkstage')) {
      dashboardUrl = 'https://dashboard.clerkstage.dev/';
    }
    await app.dev();
  });

  test.afterAll(async () => {
    // Keep files for debugging
    await app?.teardown();
  });

  test('Toggle collapse popover and claim.', async ({ page, context }) => {
    await testToggleCollapsePopoverAndClaim({ page, context, app, dashboardUrl, framework: 'nuxt' });
  });

  test('Lands on claimed application with missing explicit keys, expanded by default, click to get keys from dashboard.', async ({
    page,
    context,
  }) => {
    await testClaimedAppWithMissingKeys({ page, context, app, dashboardUrl });
  });

  test('Keyless popover is removed after adding keys to .env and restarting.', async ({ page, context }) => {
    await testKeylessRemovedAfterEnvAndRestart({ page, context, app });
  });
});
