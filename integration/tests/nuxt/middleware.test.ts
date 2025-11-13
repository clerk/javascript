import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { createTestUtils } from '../../testUtils';

test.describe('custom middleware @nuxt', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    app = await appConfigs.nuxt.node
      .clone()
      .setName('nuxt-custom-middleware')
      .addFile(
        'nuxt.config.js',
        () => `export default defineNuxtConfig({
          modules: ['@clerk/nuxt'],
          devtools: { enabled: false },
          clerk: {
            skipServerMiddleware: true
          }
        });`,
      )
      .addFile(
        'server/middleware/clerk.js',
        () => `import { clerkMiddleware, createRouteMatcher } from '@clerk/nuxt/server';

        export default clerkMiddleware((event) => {
          const { userId } = event.context.auth();
          const isProtectedRoute = createRouteMatcher(['/api/me']);

          if (!userId && isProtectedRoute(event)) {
            throw createError({
              statusCode: 401,
              statusMessage: 'You are not authorized to access this resource.'
            })
          }
        });
      `,
      )
      .addFile(
        'app/pages/me.vue',
        () => `<script setup>
        const { data, error } = await useFetch('/api/me');
        </script>

        <template>
          <div v-if="data">Hello, {{ data.firstName }}</div>
          <div v-else-if="error">{{ error.statusCode }}: {{ error.statusMessage }}</div>
          <div v-else>Unknown status</div>
        </template>`,
      )
      .commit();

    await app.setup();
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
