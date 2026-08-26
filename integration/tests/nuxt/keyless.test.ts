import * as path from 'node:path';

import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { fs } from '../../scripts';
import { createTestUtils } from '../../testUtils';

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
    await expect(page.getByText('Publishable key is missing').first()).toBeVisible();
    await expect(page.getByText('npx clerk@latest init').first()).toBeVisible();
  });

  test('Claimed application with keys inside .env boots and serves the app.', async ({ page, context }) => {
    /**
     * Seed claimed keyless state directly: the SDK no longer mints keys, so write the
     * keys fixture to `.clerk/.tmp/keyless.json` and configure the matching environment
     * (keys AND api url, so the server-side onboarding-completion call targets the right
     * instance). The completion request itself is BAPI-bound from the server, invisible
     * to Playwright — its logic is covered by packages/nuxt keyless unit tests.
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
    await app.withEnv(appConfigs.envs.withEmailCodes);
    // Restart the dev server to pick up new env vars
    await app.restart();

    const u = createTestUtils({ app, page, context });
    await u.page.goToAppHome();
    await u.page.waitForClerkJsLoaded();
    await u.po.expect.toBeSignedOut();
  });
});
