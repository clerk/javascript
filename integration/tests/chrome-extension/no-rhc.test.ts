import { copyFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';

import { chromium, expect, test } from '@playwright/test';

import { createBaseEnvironmentJSON } from '../../../packages/clerk-js/src/test/fixtures';

for (const environmentType of ['development', 'production'] as const) {
  test(`no-RHC runtime ignores configured script loaders (${environmentType}) @chrome-extension`, async () => {
    const extensionPath = await mkdtemp(path.join(tmpdir(), 'clerk-no-rhc-'));
    await Promise.all([
      copyFile(
        path.resolve(import.meta.dirname, '../../../packages/clerk-js/dist/clerk.no-rhc.mjs'),
        path.join(extensionPath, 'clerk.mjs'),
      ),
      writeFile(
        path.join(extensionPath, 'manifest.json'),
        JSON.stringify({
          manifest_version: 3,
          name: 'Clerk no-RHC regression',
          version: '1.0.0',
          background: { service_worker: 'background.js' },
          host_permissions: ['https://clerk.example.com/*'],
          content_security_policy: { extension_pages: "script-src 'self'; object-src 'self'" },
        }),
      ),
      writeFile(path.join(extensionPath, 'background.js'), 'chrome.runtime.onInstalled.addListener(() => {});'),
      writeFile(path.join(extensionPath, 'popup.html'), '<body><script type="module" src="popup.js"></script></body>'),
      writeFile(
        path.join(extensionPath, 'popup.js'),
        `import { Clerk } from './clerk.mjs';
const clerk = new Clerk('${environmentType === 'production' ? 'pk_live_' : 'pk_test_'}' + btoa('clerk.example.com$'));
await clerk.load({ standardBrowser: false, telemetry: false });
document.body.dataset.loaded = String(clerk.loaded);
`,
      ),
    ]);

    const context = await chromium.launchPersistentContext('', {
      headless: false,
      bypassCSP: false,
      args: ['--headless=new', `--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    });

    try {
      const environment = createBaseEnvironmentJSON();
      environment.display_config.instance_environment_type = environmentType;
      environment.protect_config = {
        id: 'protect_config_test',
        object: 'protect_config',
        loaders: [
          { type: 'script', attributes: { src: 'https://example.com/device-intelligence.js' } },
          { type: 'script', text_content: 'window.remoteLoaderExecuted = true;' },
        ],
      };

      let environmentRequests = 0;
      await context.route('https://clerk.example.com/**', async route => {
        const isEnvironment = new URL(route.request().url()).pathname === '/v1/environment';
        if (isEnvironment) {
          environmentRequests++;
        }
        await route.fulfill({
          json: {
            response: isEnvironment ? environment : { object: 'client', id: 'client_test', sessions: [] },
          },
        });
      });

      const background = context.serviceWorkers()[0] || (await context.waitForEvent('serviceworker'));
      const extensionId = new URL(background.url()).host;
      const page = await context.newPage();
      const remoteScripts: string[] = [];
      const errors: string[] = [];
      page.on('request', request => {
        if (request.resourceType() === 'script' && request.url().startsWith('https://')) {
          remoteScripts.push(request.url());
        }
      });
      page.on('console', message => {
        if (message.type() === 'error') {
          errors.push(message.text());
        }
      });
      page.on('pageerror', error => errors.push(error.message));

      await page.goto(`chrome-extension://${extensionId}/popup.html`);
      await expect(page.locator('body')).toHaveAttribute('data-loaded', 'true');
      expect(environmentRequests).toBeGreaterThan(0);
      await expect(page.locator('script[src^="https://"], script:not([src])')).toHaveCount(0);
      expect(remoteScripts).toEqual([]);
      expect(errors).toEqual([]);
    } finally {
      await context.close();
      await rm(extensionPath, { recursive: true, force: true });
    }
  });
}
