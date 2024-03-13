import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('sign in flow @generic @nextjs', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
    });
    await u.services.users.createBapiUser(fakeUser);
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

  test('sign in with email and password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();
  });

  test('sign in with email and instant password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();
  });

  test('sign in with email code', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.getIdentifierInput().fill(fakeUser.email);
    await u.po.signIn.continue();
    await u.po.signIn.getUseAnotherMethodLink().click();
    await u.po.signIn.getAltMethodsEmailCodeButton().click();
    await u.po.signIn.enterTestOtpCode();
    await u.po.expect.toBeSignedIn();
  });

  test('sign in with phone number and password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.usePhoneNumberIdentifier().click();
    await u.po.signIn.getIdentifierInput().fill(fakeUser.phoneNumber);
    await u.po.signIn.setPassword(fakeUser.password);
    await u.po.signIn.continue();
    await u.po.expect.toBeSignedIn();
  });

  test('sign in only with phone number', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const fakeUserWithoutPassword = u.services.users.createFakeUser({
      fictionalEmail: true,
      withoutPassword: true,
    });
    await u.services.users.createBapiUser(fakeUserWithoutPassword);
    await u.po.signIn.goTo();
    await u.po.signIn.usePhoneNumberIdentifier().click();
    await u.po.signIn.getIdentifierInput().fill(fakeUserWithoutPassword.phoneNumber);
    await u.po.signIn.continue();
    await u.po.signIn.enterTestOtpCode();
    await u.po.expect.toBeSignedIn();
  });

  test('access protected page @express', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    expect(await u.page.locator("data-test-id='protected-api-response'").count()).toEqual(0);
    await u.page.goToRelative('/protected');
    await u.page.isVisible("data-test-id='protected-api-response'");
  });
});
