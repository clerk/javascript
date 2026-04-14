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

const clerkMiddlewareFile = () => `import { clerkMiddleware, createRouteMatcher } from '@clerk/nuxt/server';

        const isProtectedRoute = createRouteMatcher(['/api/me', '/api/admin(.*)']);

        export default clerkMiddleware((event) => {
          const { userId } = event.context.auth();

          if (!userId && isProtectedRoute(event)) {
            throw createError({
              statusCode: 401,
              statusMessage: 'You are not authorized to access this resource.'
            })
          }
        });
      `;

const adminApiRouteFile = () => `export default defineEventHandler((event) => {
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

test.describe('custom middleware @nuxt', () => {
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

  test('guard API route with custom middleware', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser();
    await u.services.users.createBapiUser(fakeUser);

    // Verify unauthorized access is blocked
    await u.page.goToAppHome();
    await u.po.expect.toBeSignedOut();
    await u.page.goToRelative('/me');
    await expect(u.page.getByText('401: You are not authorized to access this resource')).toBeVisible();

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
});

test.describe('percent-encoded URL handling @nuxt', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;

  test.beforeAll(async () => {
    test.setTimeout(90_000);
    app = await appConfigs.nuxt.node
      .clone()
      .setName('nuxt-custom-middleware')
      .addFile('nuxt.config.js', nuxtConfigFile)
      .addFile('server/middleware/clerk.js', clerkMiddlewareFile)
      .addFile('server/api/admin/[...action].js', adminApiRouteFile)
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

  test('handle percent-encoded URL on protected routes', async () => {
    const normalRes = await fetch(app.serverUrl + '/api/admin/users');
    expect(normalRes.status).toBe(401);

    // %61 = 'a': /api/%61dmin/users decodes to /api/admin/users
    const encodedRes = await fetch(app.serverUrl + '/api/%61dmin/users');
    expect(encodedRes.status).toBe(401);

    // %64 = 'd': /api/a%64min/users decodes to /api/admin/users
    const encodedRes2 = await fetch(app.serverUrl + '/api/a%64min/users');
    expect(encodedRes2.status).toBe(401);
  });

  test('double-encoded URLs do not match route (Nitro router rejects)', async () => {
    // %2561 decodes one layer to %61 — Nitro's file-based router does not
    // match %2561dmin to the admin/ directory, returning 404
    const res = await fetch(app.serverUrl + '/api/%2561dmin/users');
    expect(res.status).toBe(404);
  });

  test('encoded slash is caught by middleware as protected route', async () => {
    // %2F decodes to / — our matcher sees /api/admin/users after decode
    // and correctly identifies it as protected, returning 401
    const res = await fetch(app.serverUrl + '/api%2Fadmin/users');
    expect(res.status).toBe(401);
  });

  test('null byte in path is caught by middleware as protected route', async () => {
    // %00 decodes to a null char — /api/admin\0/users still matches
    // /api/admin(.*) so our middleware correctly blocks it with 401
    const res = await fetch(app.serverUrl + '/api/admin%00/users');
    expect(res.status).toBe(401);
  });

  test('malformed percent-encoding returns 400 (clerkMiddleware catches MalformedURLError)', async () => {
    // %zz is not valid percent-encoding — createPathMatcher throws
    // MalformedURLError, which clerkMiddleware catches and returns 400
    const res = await fetch(app.serverUrl + '/api/%zz/users');
    expect(res.status).toBe(400);
  });

  test('double slashes cannot bypass protected route', async () => {
    // Double slashes before the protected segment
    const res1 = await fetch(app.serverUrl + '//api/admin/users');
    expect(res1.status).not.toBe(200);

    // Double slashes in the middle of the path
    const res2 = await fetch(app.serverUrl + '/api//admin/users');
    expect(res2.status).not.toBe(200);
  });
});
