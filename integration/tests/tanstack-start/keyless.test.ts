import * as path from 'node:path';

import { automatedEnvironmentVariables } from '@clerk/shared/utils';
import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { fs } from '../../scripts';
import { createTestUtils } from '../../testUtils';

const commonSetup = appConfigs.tanstack.reactStart.clone();

test.describe('Keyless mode @tanstack-react-start', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(90_000);

  test.use({
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '',
    },
  });

  let app: Application;

  test.beforeAll(async () => {
    app = await commonSetup.commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withKeyless);
    // Without keys the app 500s on every request, so readiness can't wait for a 2xx
    await app.dev({ acceptAnyResponse: true });
  });

  test.afterAll(async () => {
    await app?.teardown();
  });

  test('Without keys, requests fail with the missing env vars error instead of keyless bootstrap.', async ({
    page,
  }) => {
    const response = await page.goto(`${app.serverUrl}/`);
    expect(response?.status()).toBe(500);
    expect(app.devOutput).toContain('Publishable key is missing');
    expect(app.devOutput).toContain('npx clerk@latest init');
  });

  test('Claimed application with keys inside .env boots and serves the app.', async ({ page, context }) => {
    // The SDK no longer mints keys, so seed the claimed keyless state directly
    const publishableKey = appConfigs.envs.withEmailCodes.publicVariables.get('CLERK_PUBLISHABLE_KEY');
    const secretKey = appConfigs.envs.withEmailCodes.privateVariables.get('CLERK_SECRET_KEY');
    await fs.ensureDir(path.join(app.appDir, '.clerk', '.tmp'));
    await fs.writeJSON(path.join(app.appDir, '.clerk', '.tmp', 'keyless.json'), {
      publishableKey,
      secretKey,
      claimUrl: 'https://dashboard.clerk.com/apps/claim',
      apiKeysUrl: 'https://dashboard.clerk.com/~/api-keys',
    });
    // `base` disables keyless and CI counts as automated, so undo both (as `withKeyless` does) or the claimed-onboarding path never runs
    const claimedEnv = appConfigs.envs.withEmailCodes.clone().setEnvVariable('public', 'CLERK_KEYLESS_DISABLED', false);
    automatedEnvironmentVariables.forEach(name => claimedEnv.setEnvVariable('private', name, 'false'));
    await app.withEnv(claimedEnv);
    // Restart the dev server to pick up new env vars
    await app.restart();

    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();
    expect(app.devOutput).toContain('Your application is running with your claimed keys');
  });
});
