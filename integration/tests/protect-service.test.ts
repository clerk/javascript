import type { ProtectConfigJSON } from '@clerk/shared/types';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

const mockProtectSettings = async (page: Page, config?: ProtectConfigJSON) => {
  await page.route('*/**/v1/environment*', async route => {
    const response = await route.fetch();
    const json = await response.json();
    const newJson = {
      ...json,
      ...(config ? { protect_config: config } : {}),
    };
    await route.fulfill({ response, json: newJson });
  });
};

testAgainstRunningApps({ withEnv: [appConfigs.envs.withProtectService] })(
  'Clerk Protect checks @generic',
  ({ app }) => {
    test.describe.configure({ mode: 'parallel' });

    test.afterAll(async () => {
      await app.teardown();
    });

    test('should add loader script when protect_config.loader is set', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await mockProtectSettings(page, {
        object: 'protect_config',
        id: 'n',
        loaders: [
          {
            rollout: 1.0,
            type: 'script',
            target: 'body',
            attributes: { id: 'test-protect-loader-1', type: 'module', src: 'data:application/json;base64,Cgo=' },
          },
        ],
      });
      await u.page.goToAppHome();
      await u.page.waitForClerkJsLoaded();

      await expect(page.locator('#test-protect-loader-1')).toHaveAttribute('type', 'module');
    });

    test('should not add loader script when protect_config.loader is set and rollout 0.00', async ({
      page,
      context,
    }) => {
      const u = createTestUtils({ app, page, context });
      await mockProtectSettings(page, {
        object: 'protect_config',
        id: 'n',
        loaders: [
          {
            rollout: 0, // force 0% rollout, should not materialize
            type: 'script',
            target: 'body',
            attributes: { id: 'test-protect-loader-2', type: 'module', src: 'data:application/json;base64,Cgo=' },
          },
        ],
      });
      await u.page.goToAppHome();
      await u.page.waitForClerkJsLoaded();

      await expect(page.locator('#test-protect-loader-2')).toHaveCount(0);
    });

    test('should not create loader element when protect_config.loader is not set', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await mockProtectSettings(page);
      await u.page.goToAppHome();
      await u.page.waitForClerkJsLoaded();

      // Playwright locators are always objects, never undefined
      await expect(page.locator('#test-protect-loader')).toHaveCount(0);
    });

    test('should load bootstrap script, set protectState, and include in FAPI requests', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Create a bootstrap script that sets window.__internal_protectState
      const bootstrapScript = `
        window.__internal_protectState = Promise.resolve({
          v: 1,
          id: 'test-protect-state-id-123'
        });
      `;
      const encodedScript = Buffer.from(bootstrapScript).toString('base64');

      // Set up request interception to verify the protect state query parameter
      let protectStateParam: string | null = null;
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/v1/client')) {
          const urlObj = new URL(url);
          if (urlObj.searchParams.has('_clerk_protect_id')) {
            protectStateParam = urlObj.searchParams.get('_clerk_protect_id');
          }
        }
      });

      await mockProtectSettings(page, {
        object: 'protect_config',
        id: 'protect_config_test',
        loaders: [
          {
            rollout: 1.0,
            type: 'script',
            target: 'body',
            bootstrap: true,
            attributes: {
              id: 'test-bootstrap-loader',
              src: `data:text/javascript;base64,${encodedScript}`,
            },
          },
        ],
        protectStateTimeout: 2000,
      });

      await u.page.goToAppHome();

      await u.page.waitForClerkJsLoaded();

      // Verify bootstrap script was loaded
      const scriptCount = await page.locator('#test-bootstrap-loader').count();
      await expect(page.locator('#test-bootstrap-loader')).toHaveCount(1);

      // Verify protectState was set on window
      const protectStateOnWindow = await page.evaluate(() => {
        return (window as any).__internal_protectState;
      });
      expect(protectStateOnWindow).toBeDefined();

      // Wait a bit to ensure any FAPI requests have been made
      await page.waitForTimeout(500);

      // Verify the protect state ID was included in FAPI requests
      expect(protectStateParam).toBe('test-protect-state-id-123');
    });

    test('should wait for protectState promise to resolve with timeout', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      let protectStateParam: string | null = null;
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/v1/client')) {
          const urlObj = new URL(url);
          if (urlObj.searchParams.has('_clerk_protect_id')) {
            protectStateParam = urlObj.searchParams.get('_clerk_protect_id');
          }
        }
      });

      // Create a bootstrap script that resolves after a delay
      const bootstrapScript = `
        window.__internal_protectState = new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              v: 1,
              id: 'delayed-protect-state-id'
            });
          }, 500);
        });
      `;
      const encodedScript = Buffer.from(bootstrapScript).toString('base64');

      await mockProtectSettings(page, {
        object: 'protect_config',
        id: 'protect_config_test',
        loaders: [
          {
            rollout: 1.0,
            type: 'script',
            target: 'body',
            bootstrap: true,
            attributes: {
              id: 'test-delayed-bootstrap',
              src: `data:text/javascript;base64,${encodedScript}`,
            },
          },
        ],
        protectStateTimeout: 1500, // Timeout is longer than the delay
      });

      await u.page.goToAppHome();
      await u.page.waitForClerkJsLoaded();

      // Wait for the delayed promise to resolve
      await page.waitForTimeout(1000);

      // Verify the protect state ID was included after promise resolved
      expect(protectStateParam).toBe('delayed-protect-state-id');
    });

    test('should handle timeout when protectState promise takes too long', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      let protectStateParam: string | null = null;
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/v1/client')) {
          const urlObj = new URL(url);
          if (urlObj.searchParams.has('_clerk_protect_id')) {
            protectStateParam = urlObj.searchParams.get('_clerk_protect_id');
          }
        }
      });

      // Create a bootstrap script that never resolves quickly enough
      const bootstrapScript = `
        window.__internal_protectState = new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              v: 1,
              id: 'too-slow-protect-state-id'
            });
          }, 2000); // Takes 2 seconds
        });
      `;
      const encodedScript = Buffer.from(bootstrapScript).toString('base64');

      await mockProtectSettings(page, {
        object: 'protect_config',
        id: 'protect_config_test',
        loaders: [
          {
            rollout: 1.0,
            type: 'script',
            target: 'body',
            bootstrap: true,
            attributes: {
              id: 'test-timeout-bootstrap',
              src: `data:text/javascript;base64,${encodedScript}`,
            },
          },
        ],
        protectStateTimeout: 500, // Timeout is shorter than the delay
      });

      // Expect the page load to throw an error due to timeout
      await u.page.goToAppHome();

      // The timeout error should be thrown, but Clerk should still load
      // Since this is a timeout, protectState should be undefined
      await page.waitForTimeout(1000);

      // Verify no protect state query parameter was included (since it timed out)
      expect(protectStateParam).toBeNull();
    });

    test('should handle error when bootstrap script does not create protectState promise', async ({
      page,
      context,
    }) => {
      const u = createTestUtils({ app, page, context });

      let protectStateParam: string | null = null;
      page.on('request', request => {
        const url = request.url();
        if (url.includes('/v1/client')) {
          const urlObj = new URL(url);
          if (urlObj.searchParams.has('_clerk_protect_id')) {
            protectStateParam = urlObj.searchParams.get('_clerk_protect_id');
          }
        }
      });

      // Create a bootstrap script that does NOT set window.__internal_protectState
      const bootstrapScript = `
        console.log('Bootstrap loaded but forgot to set protectState');
      `;
      const encodedScript = Buffer.from(bootstrapScript).toString('base64');

      await mockProtectSettings(page, {
        object: 'protect_config',
        id: 'protect_config_test',
        loaders: [
          {
            rollout: 1.0,
            type: 'script',
            target: 'body',
            bootstrap: true,
            attributes: {
              id: 'test-missing-promise-bootstrap',
              src: `data:text/javascript;base64,${encodedScript}`,
            },
          },
        ],
        protectStateTimeout: 1000,
      });

      // Expect the page load to throw an error
      await u.page.goToAppHome();

      // Wait to see if any requests are made
      await page.waitForTimeout(1500);

      // Verify no protect state query parameter was included
      expect(protectStateParam).toBeNull();
    });

    test('should warn when multiple bootstrap loaders are configured', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      const bootstrapScript1 = `
        window.__internal_protectState = Promise.resolve({
          v: 1,
          id: 'first-bootstrap'
        });
      `;
      const bootstrapScript2 = `
        window.__internal_protectState = Promise.resolve({
          v: 1,
          id: 'second-bootstrap'
        });
      `;

      await mockProtectSettings(page, {
        object: 'protect_config',
        id: 'protect_config_test',
        loaders: [
          {
            rollout: 1.0,
            type: 'script',
            target: 'body',
            bootstrap: true,
            attributes: {
              id: 'test-bootstrap-1',
              src: `data:text/javascript;base64,${Buffer.from(bootstrapScript1).toString('base64')}`,
            },
          },
          {
            rollout: 1.0,
            type: 'script',
            target: 'body',
            bootstrap: true, // Second bootstrap loader (invalid)
            attributes: {
              id: 'test-bootstrap-2',
              src: `data:text/javascript;base64,${Buffer.from(bootstrapScript2).toString('base64')}`,
            },
          },
        ],
        protectStateTimeout: 1000,
      });

      // Listen for console warnings
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'warn' || msg.type() === 'warning') {
          consoleMessages.push(msg.text());
        }
      });

      await u.page.goToAppHome();
      await u.page.waitForClerkJsLoaded();

      // Wait a bit for warning to be logged
      await page.waitForTimeout(500);

      // Verify warning was logged about multiple bootstrap loaders
      expect(consoleMessages.some(msg => msg.includes('multiple bootstrap loaders'))).toBe(true);

      // Verify neither bootstrap script was loaded (due to validation failure)
      await expect(page.locator('#test-bootstrap-1')).toHaveCount(0);
      await expect(page.locator('#test-bootstrap-2')).toHaveCount(0);
    });

    test('should include protectState in FAPI requests after bootstrap loads', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      const bootstrapScript = `
        window.__internal_protectState = Promise.resolve({
          v: 1,
          id: 'protect-id-for-fapi'
        });
      `;

      await mockProtectSettings(page, {
        object: 'protect_config',
        id: 'protect_config_test',
        loaders: [
          {
            rollout: 1.0,
            type: 'script',
            target: 'body',
            bootstrap: true,
            attributes: {
              src: `data:text/javascript;base64,${Buffer.from(bootstrapScript).toString('base64')}`,
            },
          },
        ],
        protectStateTimeout: 1000,
      });

      // Track all FAPI requests
      const fapiRequests: Array<{ path: string; protectId: string | null }> = [];
      await page.route('*/**/v1/**', async route => {
        const request = route.request();
        const url = new URL(request.url());
        fapiRequests.push({
          path: url.pathname,
          protectId: url.searchParams.get('_clerk_protect_id'),
        });
        await route.continue();
      });

      await u.page.goToAppHome();
      await u.page.waitForClerkJsLoaded();

      // Wait for requests to complete
      await page.waitForTimeout(500);

      // Find client requests (should have the protect state query parameter)
      const clientRequests = fapiRequests.filter(req => req.path.includes('/client'));

      // At least one client request should have the protect state query parameter
      expect(clientRequests.some(req => req.protectId === 'protect-id-for-fapi')).toBe(true);
    });
  },
);
