import * as path from 'node:path';

import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import { fs } from '../scripts';
import { createTestUtils } from '../testUtils';
import { mockClaimedInstanceEnvironmentCall } from '../testUtils/keylessHelpers';

const commonSetup = appConfigs.next.appRouterQuickstart.clone();

test.describe('Keyless mode @quickstart', () => {
  test.describe.configure({ mode: 'serial' });

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
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('Without keys, the app fails with the missing env vars error instead of keyless bootstrap.', async ({
    page,
  }) => {
    const response = await page.goto(`${app.serverUrl}/`);
    expect(response?.status()).toBe(500);
    const content = await page.content();
    expect(content).toContain('Missing publishableKey');
    expect(content).toContain('npx clerk@latest init');
  });

  test('Claimed application with keys inside .env mounts the keyless prompt; on dismiss, it is removed.', async ({
    page,
    context,
  }) => {
    /**
     * Seed claimed keyless state directly: the SDK no longer mints keys, so write the
     * keys fixture to `.clerk/.tmp/keyless.json` and copy the matching keys into `.env`.
     */
    const publishableKey = appConfigs.envs.withEmailCodes.publicVariables.get('CLERK_PUBLISHABLE_KEY');
    const secretKey = appConfigs.envs.withEmailCodes.privateVariables.get('CLERK_SECRET_KEY');
    await fs.ensureDir(path.join(app.appDir, '.clerk', '.tmp'));
    await fs.writeJSON(path.join(app.appDir, '.clerk', '.tmp', 'keyless.json'), {
      publishableKey,
      secretKey,
      claimUrl: 'https://dashboard.clerk.com/apps/claim',
      apiKeysUrl: 'https://dashboard.clerk.com/last-active?path=api-keys',
    });
    await app.keylessToEnv();
    /**
     * wait a bit for the server to load the new env file
     */
    await page.waitForTimeout(5_000);

    await mockClaimedInstanceEnvironmentCall(page);
    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();

    await u.po.keylessPopover.waitForMounted();
    await u.po.keylessPopover.promptToDismiss().click();

    await u.po.keylessPopover.waitForUnmounted();
  });
});
