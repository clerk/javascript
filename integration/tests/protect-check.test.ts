import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

const waitForProtectCheckSubmit = (page: Page) =>
  page.waitForResponse(
    response => response.request().method() === 'POST' && response.url().includes('/protect_check'),
    { timeout: 30_000 },
  );

const protectCheckModalSelector = '.cl-modalContent:has(.cl-protectCheck-root)';

const waitForProtectCheckModal = (page: Page) =>
  page.waitForFunction(selector => !!document.querySelector(selector), protectCheckModalSelector, {
    timeout: 30_000,
  });

test.describe('protect check @generic', () => {
  test.describe.configure({ mode: 'serial' });

  let app: Application;
  let fakeUser: FakeUser | undefined;

  test.beforeAll(async () => {
    test.setTimeout(150_000);
    app = await appConfigs.react.vite.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withProtectService);
    await app.dev();
  });

  test.afterEach(async () => {
    await fakeUser?.deleteIfExists();
    fakeUser = undefined;
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('passes the challenge on sign-up', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    fakeUser = u.services.users.createFakeUser(test);
    const protectCheckSubmit = waitForProtectCheckSubmit(page);

    await u.po.signUp.goTo();
    const protectCheckRoute = page.waitForURL(/protect-check/, { timeout: 30_000 });
    await u.po.signUp.signUpWithEmailAndPassword({ email: fakeUser.email!, password: fakeUser.password });

    await protectCheckRoute;
    expect((await protectCheckSubmit).ok()).toBe(true);
    await u.po.signUp.enterTestOtpCode();
    await u.po.expect.toBeSignedIn();
  });

  test('passes the challenge on sign-in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    fakeUser = u.services.users.createFakeUser(test);
    await u.services.users.createBapiUser(fakeUser);
    const protectCheckSubmit = waitForProtectCheckSubmit(page);

    await u.po.signIn.goTo();
    const protectCheckRoute = page.waitForURL(/protect-check/, { timeout: 30_000 });
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: fakeUser.email!,
      password: fakeUser.password,
      waitForSession: false,
    });

    await protectCheckRoute;
    expect((await protectCheckSubmit).ok()).toBe(true);
    await u.po.signIn.enterTestOtpCode();
    await u.po.expect.toBeSignedIn();
  });
});

test.describe('protect check in custom flows @custom', () => {
  test.describe.configure({ mode: 'serial' });

  let app: Application;
  let fakeUser: FakeUser | undefined;

  test.beforeAll(async () => {
    test.setTimeout(150_000);
    app = await appConfigs.customFlows.reactVite.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withProtectService);
    await app.dev();
  });

  test.afterEach(async () => {
    await fakeUser?.deleteIfExists();
    fakeUser = undefined;
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('shows the Protect modal on sign-up', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    fakeUser = u.services.users.createFakeUser(test);
    const protectCheckSubmit = waitForProtectCheckSubmit(page);
    const prepareVerification = page.waitForResponse(
      response => response.request().method() === 'POST' && response.url().includes('prepare_verification'),
      { timeout: 30_000 },
    );

    await u.page.goToRelative('/sign-up');
    await expect(u.page.getByText('Sign up', { exact: true })).toBeVisible();
    const protectCheckModal = waitForProtectCheckModal(page);
    await u.po.signUp.signUp({ email: fakeUser.email!, password: fakeUser.password });

    expect((await protectCheckSubmit).ok()).toBe(true);
    await protectCheckModal;
    await page.locator(protectCheckModalSelector).waitFor({ state: 'detached' });
    await prepareVerification;
    await u.page.getByRole('textbox', { name: 'code' }).fill('424242');
    await u.po.signUp.continue();
    await u.page.waitForURL(/protected/);
    await u.po.expect.toBeSignedIn();
  });

  test('shows the Protect modal on sign-in', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    fakeUser = u.services.users.createFakeUser(test);
    await u.services.users.createBapiUser(fakeUser);
    const protectCheckSubmit = waitForProtectCheckSubmit(page);

    await u.page.goToRelative('/sign-in');
    await expect(u.page.getByText('Sign in', { exact: true })).toBeVisible();
    const protectCheckModal = waitForProtectCheckModal(page);
    await u.po.signIn.setIdentifier(fakeUser.email!);
    await u.po.signIn.continue();

    expect((await protectCheckSubmit).ok()).toBe(true);
    await protectCheckModal;
    await page.locator(protectCheckModalSelector).waitFor({ state: 'detached' });
    await u.page.getByRole('button', { name: 'email_code', exact: true }).click();
    await u.page.getByRole('textbox', { name: 'code' }).fill('424242');
    await u.po.signIn.continue();
    await u.page.waitForURL(/protected/);
    await u.po.expect.toBeSignedIn();
  });

  test('goes to the SSO provider before the Protect challenge', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const protectCheckRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/protect_check')) {
        protectCheckRequests.push(request.url());
      }
    });
    let createStatus: string | undefined;
    await page.route(
      url => url.pathname.endsWith('/v1/client/sign_ins'),
      async route => {
        if (route.request().method() !== 'POST') {
          return route.fallback();
        }
        const response = await route.fetch();
        createStatus = (await response.json()).response?.status;
        await route.fulfill({ response });
      },
    );

    await u.page.goToRelative('/sign-in');
    await expect(u.page.getByText('Sign in', { exact: true })).toBeVisible();
    await page.waitForFunction(() => !!window.Clerk?.loaded && !!window.Clerk?.client);
    const providerRedirect = page.waitForURL(/accounts\.google\.com/, { waitUntil: 'commit' });
    await page.evaluate(() => {
      void window.Clerk.client?.signIn.__internal_future.sso({
        strategy: 'oauth_google',
        redirectUrl: '/protected',
        redirectCallbackUrl: '/sso-callback',
      });
    });

    await providerRedirect;
    expect(createStatus).toBe('needs_protect_check');
    expect(protectCheckRequests).toEqual([]);
  });
});
