import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes], withPattern: ['next.cacheComponents'] })(
  'Next.js Cache Components @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let fakeUser: FakeUser;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });
      fakeUser = u.services.users.createFakeUser();
      await u.services.users.createBapiUser(fakeUser);
    });

    test.afterAll(async () => {
      await fakeUser.deleteIfExists();
      await app.teardown();
    });

    test('home page loads with navigation', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/');
      await expect(u.page.getByText('Next.js Cache Components Test App')).toBeVisible();
      await expect(u.page.getByRole('link', { name: 'auth() in Server Component' })).toBeVisible();
    });

    test('auth() in server component works when signed out', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/auth-server-component');
      await expect(u.page.getByText('auth() in Server Component')).toBeVisible();
      await expect(u.page.getByTestId('user-id')).toContainText('Not signed in');
    });

    test('auth() in server component works when signed in', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Sign in first
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });
      await u.po.expect.toBeSignedIn();

      // Navigate to server component page
      await u.page.goToRelative('/auth-server-component');
      await expect(u.page.getByText('auth() in Server Component')).toBeVisible();

      // Should show user ID (starts with 'user_')
      const userIdElement = u.page.getByTestId('user-id');
      await expect(userIdElement).toBeVisible();
      const userId = await userIdElement.textContent();
      expect(userId).toMatch(/^user_/);
    });

    test('auth() in server action works', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Sign in first
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });
      await u.po.expect.toBeSignedIn();

      // Navigate to server action page
      await u.page.goToRelative('/auth-server-action');
      await expect(u.page.getByText('auth() in Server Action')).toBeVisible();

      // Click the button to trigger the server action
      await u.page.getByTestId('check-auth-btn').click();

      // Should show user ID from the action
      await expect(u.page.getByTestId('action-user-id')).toBeVisible();
      const userId = await u.page.getByTestId('action-user-id').textContent();
      expect(userId).toMatch(/^user_/);
    });

    test('auth() in API route works', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Sign in first
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });
      await u.po.expect.toBeSignedIn();

      // Call the API route
      const response = await page.request.get(`${app.serverUrl}/api/auth-check`);
      expect(response.ok()).toBe(true);

      const data = await response.json();
      expect(data.userId).toMatch(/^user_/);
      expect(data.isSignedIn).toBe(true);
    });

    test('"use cache" correct pattern works', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Sign in first
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });
      await u.po.expect.toBeSignedIn();

      // Navigate to correct pattern page
      await u.page.goToRelative('/use-cache-correct');
      await expect(u.page.getByText('"use cache" Correct Pattern')).toBeVisible();

      // Should show cached data with user ID
      const cachedData = u.page.getByTestId('cached-data');
      await expect(cachedData).toBeVisible();
      const dataText = await cachedData.textContent();
      expect(dataText).toContain('userId');
    });

    test('"use cache" error documentation page loads', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/use-cache-error');
      await expect(u.page.getByText('"use cache" with auth() - Error Case')).toBeVisible();
      await expect(u.page.getByTestId('expected-error')).toBeVisible();
    });

    test('PPR with auth() renders correctly', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Sign in first
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });
      await u.po.expect.toBeSignedIn();

      // Navigate to PPR page
      await u.page.goToRelative('/ppr-auth');
      await expect(u.page.getByText('PPR with auth()')).toBeVisible();

      // Static content should be visible
      await expect(u.page.getByTestId('static-content')).toBeVisible();

      // Dynamic content with auth should stream in
      await expect(u.page.getByTestId('dynamic-content')).toBeVisible();
    });

    test('protected route requires authentication', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Try to access protected route without signing in
      // Should redirect to sign-in
      await u.page.goToRelative('/protected');

      // Should be redirected to sign-in
      await expect(page).toHaveURL(/sign-in/);
    });

    test('protected route accessible when authenticated', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Sign in first
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });
      await u.po.expect.toBeSignedIn();

      // Navigate to protected route
      await u.page.goToRelative('/protected');
      await expect(u.page.getByText('Protected Route')).toBeVisible();

      // Should show user ID
      const userIdElement = u.page.getByTestId('protected-user-id');
      await expect(userIdElement).toBeVisible();
      const userId = await userIdElement.textContent();
      expect(userId).toMatch(/^user_/);
    });
  },
);
