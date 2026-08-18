import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';

const commonSetup = appConfigs.reactRouter.reactRouterNode.clone();

test.describe('Keyless mode @react-router', () => {
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
    await app.dev();
  });

  test.afterAll(async () => {
    await app?.teardown();
  });

  test('Without keys, the app fails with the missing env vars error instead of keyless bootstrap.', async ({
    page,
  }) => {
    const response = await page.goto(`${app.serverUrl}/`);
    expect(response?.status()).toBe(500);
    const content = await page.content();
    expect(content).toContain('A secretKey must be provided');
    expect(content).toContain('npx clerk@latest init');
  });
});
