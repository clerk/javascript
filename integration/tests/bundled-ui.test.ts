import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withPattern: ['next.appRouterBundledUI.*'] })(
  'bundled UI smoke tests @bundled-ui',
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

    test('Clerk client loads and renders sign-in/sign-up buttons on home page', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToAppHome();
      await u.page.waitForClerkJsLoaded();
      await u.po.expect.toBeSignedOut();

      await expect(u.page.getByRole('button', { name: /Sign in/i })).toBeVisible();
      await expect(u.page.getByRole('button', { name: /Sign up/i })).toBeVisible();
    });

    test('SignIn component renders on /sign-in page', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
    });

    test('SignUp component renders on /sign-up page', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signUp.goTo();
      await u.po.signUp.waitForMounted();
    });

    test('can sign in with email and password', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();
    });

    test('UserButton renders after sign in', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToRelative('/user-button');
      await u.po.userButton.waitForMounted();
      await expect(u.page.getByRole('button', { name: /Open user menu/i })).toBeVisible();
    });

    test('can sign out through user button', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
      await u.po.expect.toBeSignedIn();

      await u.page.goToAppHome();
      await u.po.userButton.waitForMounted();
      await u.po.userButton.toggleTrigger();
      await u.po.userButton.waitForPopover();
      await u.po.userButton.triggerSignOut();
      await u.po.expect.toBeSignedOut();
    });

    test('themes page renders SignIn components with all themes', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/themes');
      await u.page.waitForClerkJsLoaded();

      await expect(u.page.getByText('Dark')).toBeVisible();
      await expect(u.page.getByText('Neobrutalism')).toBeVisible();
      await expect(u.page.getByText('Shades of Purple')).toBeVisible();
      await expect(u.page.getByText('Shadcn')).toBeVisible();
    });
  },
);
