import { execSync } from 'node:child_process';

import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { createTestUtils } from '../../testUtils';

const nuxtConfigFile = () => `export default defineNuxtConfig({
          modules: ['@clerk/nuxt'],
          devtools: { enabled: false },
          clerk: {
            skipServerMiddleware: true
          }
        });`;

const clerkMiddlewareFile = () => `import { clerkMiddleware } from '@clerk/nuxt/server';

        export default clerkMiddleware();
      `;

const adminApiRouteFile = () => `export default defineEventHandler((event) => {
          const { userId } = event.context.auth();

          if (!userId) {
            throw createError({
              statusCode: 401,
              statusMessage: 'You are not authorized to access this resource.'
            })
          }

          return { status: 'ok' };
        });`;

const mePageFile = () => `<script setup>
        const { data, error } = await useFetch('/api/me');
        </script>

        <template>
          <div v-if="data">Hello, {{ data.firstName }}</div>
          <div v-else-if="error">{{ error.statusCode }}: {{ error.statusMessage }}</div>
          <div v-else>Unknown status</div>
        </template>`;

// Paths using URL encoding tricks that historically diverged between
// middleware path matching and Nitro's routing normalization. With the auth
// check on the event handler itself, the exact router outcome (401 vs 404 vs
// 400) is Nitro's business; what must always hold is that none of these serve
// the protected resource.
const trickPaths = [
  // percent-encoded characters resolving to the protected path
  '/api/%61dmin/users',
  '/api/a%64min/users',
  // double-encoded
  '/api/%2561dmin/users',
  // encoded slash is not a path separator
  '/api%2Fadmin/users',
  // null byte
  '/api/admin%00/users',
  // malformed percent-encoding
  '/api/%zz/users',
  // encoded dot segments and traversal
  '/api/%2e/admin/users',
  '/api/%2e%2e/admin/users',
  '/api/foo/%2e%2e/admin/users',
  // fully encoded './' and '../'
  '/api%2f%2e%2fadmin/users',
  '/api%2f%2e%2e%2fadmin/users',
  '/api/foo%2f%2e%2e%2fadmin/users',
  // double slashes
  '//api/admin/users',
  '/api//admin/users',
];

test.describe('resource-based route protection @nuxt', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;

  test.beforeAll(async () => {
    app = await appConfigs.nuxt.node
      .clone()
      .setName('nuxt-custom-middleware')
      .addFile('nuxt.config.js', nuxtConfigFile)
      .addFile('server/middleware/clerk.js', clerkMiddlewareFile)
      .addFile('server/api/admin/[...action].js', adminApiRouteFile)
      .addFile('app/pages/me.vue', mePageFile)
      .commit();

    await app.setup();
    // pkglab installs with --ignore-scripts, so nuxt prepare must be run manually
    execSync('npx nuxt prepare', { cwd: app.appDir, stdio: 'pipe' });
    await app.withEnv(appConfigs.envs.withCustomRoles);
    await app.dev();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('guard API route with resource-based auth check', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser(test);
    await u.services.users.createBapiUser(fakeUser);

    // Verify unauthorized access is blocked
    await u.page.goToAppHome();
    await u.po.expect.toBeSignedOut();
    await u.page.goToRelative('/me');
    await expect(u.page.getByText('401: Unauthorized')).toBeVisible();

    // Sign in flow
    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();
    await u.page.waitForAppUrl('/');

    // Verify authorized access works
    await u.page.goToRelative('/me');
    await expect(u.page.getByText(`Hello, ${fakeUser.firstName}`)).toBeVisible();

    await fakeUser.deleteIfExists();
  });

  test('protected API route returns 401 when signed out', async () => {
    const res = await fetch(app.serverUrl + '/api/admin/users');
    expect(res.status).toBe(401);
  });

  test('no URL encoding trick can access the protected route', async () => {
    for (const path of trickPaths) {
      const res = await fetch(app.serverUrl + path);
      expect(res.status, `expected non-200 for ${path}`).not.toBe(200);
    }
  });
});
