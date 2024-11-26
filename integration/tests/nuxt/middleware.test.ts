import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { createTestUtils } from '../../testUtils';

test.describe('custom middleware @nuxt', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;

  test.beforeAll(async () => {
    app = await appConfigs.nuxt.node
      .clone()
      .setName('nuxt-custom-middleware')
      .addFile(
        'nuxt.config.js',
        () => `export default defineNuxtConfig({
          modules: ['@clerk/nuxt'],
          clerk: {
            skipServerMiddleware: true
          }
        });`,
      )
      .addFile(
        'server/api/protected.js',
        () => `export default eventHandler((event) => {
            const { userId } = event.context.auth

            return userId
        });`,
      )
      .addFile(
        'server/middleware/clerk.js',
        () => `import { clerkMiddleware } from '@clerk/nuxt/server';

        export default clerkMiddleware((event) => {
          const { userId } = event.context.auth
          if (!userId && event.path === '/api/protected') {
            throw createError({
              statusCode: 401,
              statusMessage: 'Unauthorized'
            })
          }
        });
      `,
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
    const user = await u.services.users.createBapiUser(fakeUser);

    await u.page.goToAppHome();

    await u.po.expect.toBeSignedOut();

    let response = await u.page.goToRelative('/api/protected');

    expect(response.status()).toBe(401);
    expect(response.statusText()).toBe('Unauthorized');

    await u.page.goToRelative('/sign-in');
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.waitForAppUrl('/');

    response = await u.page.goToRelative('/api/protected');

    expect(response.status()).toBe(200);
    expect(await response.text()).toBe(user.id);

    await fakeUser.deleteIfExists();
  });
});
