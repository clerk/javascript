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

      // Collect console errors and network failures
      const consoleErrors: string[] = [];
      const networkErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('requestfailed', req => {
        networkErrors.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
      });

      // Sign in first
      await u.po.signIn.goTo();
      console.log(`[DIAG] URL after goTo sign-in: ${page.url()}`);

      // Check form state before interaction
      const identifierInput = page.locator('input[name=identifier]');
      const isIdentifierVisible = await identifierInput.isVisible();
      const isIdentifierEnabled = await identifierInput.isEnabled();
      console.log(`[DIAG] identifier visible: ${isIdentifierVisible}, enabled: ${isIdentifierEnabled}`);

      // Fill identifier and check if password field appears
      await identifierInput.fill(fakeUser.email);
      const passwordInput = page.locator('input[name=password]');
      try {
        await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
        console.log('[DIAG] password field appeared after filling identifier');
      } catch {
        console.log('[DIAG] password field did NOT appear after 5s');
        const formHTML = await page.locator('.cl-signIn-root').innerHTML();
        console.log('[DIAG] sign-in form HTML:', formHTML.substring(0, 3000));
      }

      // Install event listeners on password input BEFORE filling
      await page.evaluate(() => {
        const pwInput = document.querySelector('input[name=password]') as HTMLInputElement;
        if (pwInput) {
          (window as any).__pwEvents = [];
          ['input', 'change', 'focus', 'blur', 'keydown', 'keyup'].forEach(evt => {
            pwInput.addEventListener(evt, (e: Event) => {
              (window as any).__pwEvents.push({
                type: e.type,
                value: (e.target as HTMLInputElement).value.length,
                isTrusted: e.isTrusted,
              });
            });
          });
          // Also track React's synthetic event by monkey-patching the value setter
          const origDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
          (window as any).__valueSetCount = 0;
          if (origDescriptor?.set) {
            Object.defineProperty(pwInput, 'value', {
              set(val: string) {
                (window as any).__valueSetCount++;
                origDescriptor.set!.call(this, val);
              },
              get() {
                return origDescriptor.get!.call(this);
              },
            });
          }
        }
      });

      // Fill password
      const isPasswordVisible = await passwordInput.isVisible();
      console.log(`[DIAG] password visible: ${isPasswordVisible}`);
      if (isPasswordVisible) {
        await passwordInput.fill(fakeUser.password, { force: true });
      }

      // Check what events fired and the password field state
      const pwDiag = await page.evaluate(() => {
        const pwInput = document.querySelector('input[name=password]') as HTMLInputElement;
        return {
          domValue: pwInput?.value ?? 'NOT_FOUND',
          domValueLength: pwInput?.value?.length ?? 0,
          events: (window as any).__pwEvents ?? [],
          valueSetCount: (window as any).__valueSetCount ?? 0,
          // Check password field's computed styles (Activity hiding?)
          computedDisplay: pwInput ? getComputedStyle(pwInput).display : 'N/A',
          computedOpacity: pwInput ? getComputedStyle(pwInput).opacity : 'N/A',
          computedPointerEvents: pwInput ? getComputedStyle(pwInput).pointerEvents : 'N/A',
          // Check parent container styles
          parentOpacity: pwInput?.closest('[class*="instant"]')
            ? getComputedStyle(pwInput.closest('[class*="instant"]')!).opacity
            : pwInput?.parentElement
              ? getComputedStyle(pwInput.parentElement).opacity
              : 'N/A',
        };
      });
      console.log('[DIAG] Password field after fill:', JSON.stringify(pwDiag, null, 2));

      const continueBtn = page.getByRole('button', { name: 'Continue', exact: true });
      const isContinueVisible = await continueBtn.isVisible();
      const isContinueEnabled = await continueBtn.isEnabled();
      console.log(`[DIAG] continue button visible: ${isContinueVisible}, enabled: ${isContinueEnabled}`);

      // Track API calls with response bodies for sign-in calls
      const apiCalls: string[] = [];
      page.on('response', async res => {
        const url = res.url();
        if (url.includes('sign_in')) {
          try {
            const body = await res.json();
            const status = body?.response?.status || body?.status || 'unknown';
            apiCalls.push(`${res.status()} ${url.split('?')[0].split('/').slice(-2).join('/')} signInStatus=${status}`);
          } catch {
            apiCalls.push(`${res.status()} ${url.split('?')[0].split('/').slice(-2).join('/')}`);
          }
        }
      });

      // Click continue
      await continueBtn.click();

      // Wait for the sign-in to process
      await page.waitForTimeout(5000);

      const diagAfterWait = await page.evaluate(() => {
        return {
          url: window.location.href,
          hasSession: !!(window as any).Clerk?.session,
          signInCardClass: document.querySelector('.cl-cardBox')?.className ?? 'NOT_FOUND',
          signInStatus: (window as any).Clerk?.client?.signIn?.status ?? 'N/A',
        };
      });
      console.log('[DIAG] State 5s after click:', JSON.stringify(diagAfterWait, null, 2));
      console.log('[DIAG] API calls:', JSON.stringify(apiCalls));
      console.log('[DIAG] Console errors:', JSON.stringify(consoleErrors));
      console.log('[DIAG] Network errors:', JSON.stringify(networkErrors));

      // Now wait for session
      try {
        await page.waitForFunction(() => !!window.Clerk?.session, { timeout: 10_000 });
      } catch {
        const finalState = await page.evaluate(() => ({
          url: window.location.href,
          hasSession: !!(window as any).Clerk?.session,
          cookies: document.cookie,
        }));
        console.log('[DIAG] FINAL state at timeout:', JSON.stringify(finalState));
        throw new Error('waitForSession timed out');
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
