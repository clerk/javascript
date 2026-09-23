import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';

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
    expect(app.devOutput).toContain('Missing secretKey');
    expect(app.devOutput).toContain('npx clerk@latest init');
  });
});
