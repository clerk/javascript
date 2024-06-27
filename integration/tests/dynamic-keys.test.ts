import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('dynamic keys @nextjs', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        'src/middleware.ts',
        () => `import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

        const isProtectedRoute = createRouteMatcher(['/protected']);

        export default clerkMiddleware((auth, request) => {
          if (isProtectedRoute(request)) {
            auth().protect();
          }
        }, {
          secretKey: process.env.CLERK_DYNAMIC_SECRET_KEY,
          signInUrl: '/foobar'
        });

        export const config = {
          matcher: ['/((?!.*\\\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
        };`,
      )
      .addFile(
        'src/app/current-user/page.tsx',
        () => `import { currentUser } from '@clerk/nextjs/server'

        export default async function Page(){
          const user = await currentUser()

          return <p>{user ? <p>{user.firstName}</p> : <p>User not found</p>}</p>
        }
        `,
      )
      .commit();

    await app.setup();

    await app.withEnv(appConfigs.envs.withCustomRoles);
    const m = createTestUtils({ app });
    fakeUser = m.services.users.createFakeUser();
    await m.services.users.createBapiUser(fakeUser);

    await app.withEnv(appConfigs.envs.withDynamicKeys);
    await app.dev();
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test.afterEach(async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.signOut();
    await u.page.context().clearCookies();
  });

  test('redirects to `signInUrl` on `auth().protect()`', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToStart();

    await u.po.expect.toBeSignedOut();

    await u.page.goToRelative('/protected');

    await u.page.waitForURL(/foobar/);
  });

  test('resolves auth signature with `secretKey` on `auth().protect()`', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToStart();
    await u.po.expect.toBeSignedOut();

    await u.page.goToRelative('/page-protected');

    await u.page.waitForURL(/foobar/);
  });

  test('calls `clerkClient` with dynamic keys from application runtime', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToStart();
    await u.po.expect.toBeSignedOut();
    await u.page.goToRelative('/current-user');

    await expect(u.page.getByText(/User not found/i)).toBeVisible();

    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/current-user');
    await expect(u.page.getByText(/User not found/i)).toBeVisible();
  });
});
