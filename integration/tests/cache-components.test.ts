import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes], withPattern: ['next.cacheComponents'] })(
  'Next.js Cache Components @cache-components',
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
      await expect(u.page.getByRole('link', { name: 'currentUser() in Server Component' })).toBeVisible();
      await expect(u.page.getByRole('link', { name: '"use cache" correct pattern (auth)' })).toBeVisible();
      await expect(u.page.getByRole('link', { name: '"use cache" correct pattern (currentUser)' })).toBeVisible();
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

      // Diagnostic: check for duplicate DOM elements (Activity component issue)
      const identifierInputs = await page.locator('input[name=identifier]').count();
      console.log(`[DIAG] identifier inputs in DOM: ${identifierInputs}`);
      console.log(`[DIAG] URL after goTo sign-in: ${page.url()}`);

      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
        waitForSession: false,
      });

      // Diagnostic: capture state after clicking Continue but before waiting for session
      const diagAfterSubmit = await page.evaluate(() => {
        return {
          url: window.location.href,
          clerkDefined: typeof window.Clerk !== 'undefined',
          clerkLoaded: !!(window as any).Clerk?.loaded,
          clerkVersion: (window as any).Clerk?.version,
          hasSession: !!(window as any).Clerk?.session,
          hasUser: !!(window as any).Clerk?.user,
          sessionId: (window as any).Clerk?.session?.id ?? null,
          cookies: document.cookie,
          identifierInputCount: document.querySelectorAll('input[name=identifier]').length,
          signInRootCount: document.querySelectorAll('.cl-signIn-root').length,
          activityElements: document.querySelectorAll('[data-activity]').length,
          hiddenElements: document.querySelectorAll('[hidden]').length,
        };
      });
      console.log('[DIAG] State after submit:', JSON.stringify(diagAfterSubmit, null, 2));

      // Now wait for session with extended timeout and more diagnostics
      try {
        await page.waitForFunction(
          () => !!window.Clerk?.session,
          { timeout: 15_000 },
        );
      } catch {
        // Capture state at timeout for debugging
        const diagAtTimeout = await page.evaluate(() => {
          return {
            url: window.location.href,
            clerkDefined: typeof window.Clerk !== 'undefined',
            clerkLoaded: !!(window as any).Clerk?.loaded,
            hasSession: !!(window as any).Clerk?.session,
            hasUser: !!(window as any).Clerk?.user,
            clerkStatus: (window as any).Clerk?.status,
            cookies: document.cookie,
            bodyHTML: document.body.innerHTML.substring(0, 2000),
          };
        });
        console.log('[DIAG] State at TIMEOUT:', JSON.stringify(diagAtTimeout, null, 2));
        throw new Error(`waitForSession timed out. Diagnostics logged above.`);
      }

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

    test('currentUser() in server component works when signed out', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/current-user-server-component');
      await expect(u.page.getByText('currentUser() in Server Component')).toBeVisible();
      await expect(u.page.getByTestId('current-user-id')).toContainText('Not signed in');
    });

    test('currentUser() in server component works when signed in', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Sign in first
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });
      await u.po.expect.toBeSignedIn();

      // Navigate to server component page
      await u.page.goToRelative('/current-user-server-component');
      await expect(u.page.getByText('currentUser() in Server Component')).toBeVisible();

      // Should show user ID (starts with 'user_')
      const userIdElement = u.page.getByTestId('current-user-id');
      await expect(userIdElement).toBeVisible();
      const userId = await userIdElement.textContent();
      expect(userId).toMatch(/^user_/);

      // Should also show the email
      const emailElement = u.page.getByTestId('current-user-email');
      await expect(emailElement).toBeVisible();
      const email = await emailElement.textContent();
      expect(email).toContain('@');
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

    test('"use cache" correct pattern with auth() works when signed out', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Navigate to correct pattern page without signing in
      await u.page.goToRelative('/use-cache-correct');
      await expect(u.page.getByText('"use cache" Correct Pattern')).toBeVisible();

      // Should show signed out message
      await expect(u.page.getByTestId('signed-out')).toBeVisible();
    });

    test('"use cache" correct pattern with auth() works when signed in', async ({ page, context }) => {
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

    test('"use cache" correct pattern with currentUser() works when signed out', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Navigate to correct pattern page without signing in
      await u.page.goToRelative('/current-user-cache-correct');
      await expect(u.page.getByText('currentUser() with "use cache" Correct Pattern')).toBeVisible();

      // Should show signed out message
      await expect(u.page.getByTestId('signed-out')).toBeVisible();
    });

    // TODO: clerkClient() also calls headers() internally, so it fails inside "use cache".
    // Re-enable once clerkClient() is fixed to fall through to env-based config.
    test.skip('"use cache" correct pattern with currentUser() works when signed in', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Sign in first
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });
      await u.po.expect.toBeSignedIn();

      // Navigate to correct pattern page
      await u.page.goToRelative('/current-user-cache-correct');
      await expect(u.page.getByText('currentUser() with "use cache" Correct Pattern')).toBeVisible();

      // Should show cached profile with user ID
      const cachedProfile = u.page.getByTestId('cached-profile');
      await expect(cachedProfile).toBeVisible();
      const profileText = await cachedProfile.textContent();
      expect(profileText).toContain('userId');

      // Should also show the user ID
      const userIdElement = u.page.getByTestId('current-user-id');
      await expect(userIdElement).toBeVisible();
      const userId = await userIdElement.textContent();
      expect(userId).toMatch(/^user_/);
    });

    test('PPR with auth() renders correctly when signed out', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Navigate to PPR page without signing in
      await u.page.goToRelative('/ppr-auth');
      await expect(u.page.getByText('PPR with auth()')).toBeVisible();

      // Static content should be visible (pre-rendered shell)
      await expect(u.page.getByTestId('static-content')).toBeVisible();

      // Dynamic content should stream in even when signed out
      await expect(u.page.getByTestId('dynamic-content')).toBeVisible();
    });

    test('PPR with auth() renders correctly when signed in', async ({ page, context }) => {
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

    test('dynamic route renders correctly via direct navigation', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/dynamic-route/test-123');
      await expect(u.page.getByText('Dynamic Route')).toBeVisible();
      await expect(u.page.getByTestId('route-id')).toContainText('test-123');
    });

    test('client-side navigation to dynamic route works', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/');
      await expect(u.page.getByText('Next.js Cache Components Test App')).toBeVisible();

      // Click the dynamic route link (exercises ClerkProvider's navigation hooks)
      await u.page.getByRole('link', { name: 'Dynamic Route' }).click();
      await expect(u.page.getByText('Dynamic Route')).toBeVisible();
      await expect(u.page.getByTestId('route-id')).toContainText('test-123');
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

    // TODO: Flaky — toBeSignedOut() times out in CI. Needs investigation.
    test.skip('sign out completes and navigation promise resolves', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Sign in
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });
      await u.po.expect.toBeSignedIn();

      // Navigate to a non-root page to ensure post-sign-out navigation is a real route change
      await u.page.goToRelative('/auth-server-component');
      await expect(u.page.getByText('auth() in Server Component')).toBeVisible();

      // Sign out by explicitly awaiting the full signOut() promise.
      // Internally, signOut() calls: onBeforeSetActive (cache invalidation) →
      // session removal → navigate(redirectUrl) via routerPush → useInternalNavFun →
      // startTransition(() => router.push(to)).
      // The navigate() call awaits the promise from useInternalNavFun.
      // If isPending doesn't cycle (the concern from removing usePathname in #7989),
      // the navigation promise hangs and this evaluate call times out.
      await page.evaluate(async () => {
        await window.Clerk.signOut();
      });

      await u.po.expect.toBeSignedOut();
    });

    // TODO: Flaky — signOut()/toBeSignedOut() times out in CI. Same issue as above.
    test.skip('protected route redirects to sign-in after sign out', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Sign in and access protected route
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: fakeUser.email,
        password: fakeUser.password,
      });
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/protected');
      await expect(u.page.getByText('Protected Route')).toBeVisible();

      // Sign out
      await page.evaluate(async () => {
        await window.Clerk.signOut();
      });

      await u.po.expect.toBeSignedOut();

      // Try to access protected route again — should redirect to sign-in
      // This verifies cache invalidation worked correctly alongside navigation
      await u.page.goToRelative('/protected');
      await expect(page).toHaveURL(/sign-in/);
    });
  },
);
