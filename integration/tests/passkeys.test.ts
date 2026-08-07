import type { BrowserContext, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

type SavedCredential = {
  id: string;
  rpId: string;
  userHandle: string;
  privateKey: string;
  publicKey: string;
};

// clerk-js gates WebAuthn behind isValidBrowser(), which bails when
// navigator.webdriver is true, so mask it before installing the virtual authenticator.
const installVirtualAuthenticator = async (context: BrowserContext) => {
  await context.addInitScript(() => {
    Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', { get: () => false });
  });
  await context.credentials.install();
};

let app: Application;

test.beforeAll(async () => {
  app = await appConfigs.next.appRouter.commit();
  await app.setup();
  await app.withEnv(appConfigs.envs.withPasskeys);
  await app.dev();
});

test.afterAll(async () => {
  await app.teardown();
});

test.describe('passkeys @generic', () => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;
  let savedCredential: SavedCredential;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser({ fictionalEmail: true, withPassword: true });
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
  });

  test('registers a passkey through UserProfile', async ({ page, context }) => {
    await installVirtualAuthenticator(context);

    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email!, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.po.userProfile.goTo();
    await u.po.userProfile.switchToSecurityTab();
    await u.page.getByRole('button', { name: /add a passkey/i }).click();

    await expect(u.page.locator('.cl-profileSectionItem__passkeys')).toBeVisible();

    const credentials = await context.credentials.get();
    expect(credentials).toHaveLength(1);
    savedCredential = credentials[0];
  });

  test('signs in with passkey via conditional UI autofill', async ({ page, context }) => {
    await context.credentials.create(savedCredential.rpId, savedCredential);
    await installVirtualAuthenticator(context);

    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();

    // The start page requests the passkey with mediation: 'conditional' and the
    // virtual authenticator answers it, so the sign-in completes on its own.
    await u.po.expect.toBeSignedIn();
  });

  test('signs in with passkey via identifier-first flow', async ({ page, context }) => {
    await installVirtualAuthenticator(context);

    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(fakeUser.email!);
    await u.po.signIn.continue();

    await expect(u.page.getByText('Use your passkey')).toBeVisible();
    // Seed only now: the start page's conditional-UI autofill is answered
    // instantly by the virtual authenticator and would preempt this flow.
    await context.credentials.create(savedCredential.rpId, savedCredential);
    await u.po.signIn.continue();

    await u.po.expect.toBeSignedIn();
  });

  test('signs in with a seeded passkey', async ({ page, context }) => {
    await installVirtualAuthenticator(context);

    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();

    const usePasskeyLink = u.page.getByRole('link', { name: /use passkey instead/i });
    await expect(usePasskeyLink).toBeVisible();
    // Seed after load for the same autofill-preemption reason as above.
    await context.credentials.create(savedCredential.rpId, savedCredential);
    await usePasskeyLink.click();

    await u.po.expect.toBeSignedIn();
  });
});

test.describe('passkeys as a second factor @generic', () => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;
  let savedCredential: SavedCredential;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser({ fictionalEmail: true, withPassword: true, withPhoneNumber: true });
    const user = await u.services.users.createBapiUser(fakeUser);
    // A passkey on its own never creates a 2FA requirement, so reserve the phone
    // number for MFA to park the sign-in at needs_second_factor.
    await u.services.clerk.phoneNumbers.updatePhoneNumber(user.phoneNumbers[0].id, {
      verified: true,
      reservedForSecondFactor: true,
    });
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
  });

  const signInToSecondFactor = async (page: Page, context: BrowserContext) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({
      email: fakeUser.email!,
      password: fakeUser.password,
      waitForSession: false,
    });
    await u.page.waitForURL(/\/sign-in\/factor-two/);
    return u;
  };

  test('registers a passkey for a user with two-factor enabled', async ({ page, context }) => {
    await installVirtualAuthenticator(context);

    const u = await signInToSecondFactor(page, context);

    await u.po.signIn.enterTestOtpCode();
    await u.po.expect.toBeSignedIn();

    await u.po.userProfile.goTo();
    await u.po.userProfile.switchToSecurityTab();
    await u.page.getByRole('button', { name: /add a passkey/i }).click();

    await expect(u.page.locator('.cl-profileSectionItem__passkeys')).toBeVisible();

    const credentials = await context.credentials.get();
    expect(credentials).toHaveLength(1);
    savedCredential = credentials[0];
  });

  test('offers the passkey as the starting second factor', async ({ page, context }) => {
    await installVirtualAuthenticator(context);

    const u = await signInToSecondFactor(page, context);

    // Passkey outranks the enrolled phone code once the backend advertises it.
    await expect(u.page.getByText('Use your passkey')).toBeVisible();
    // Seed only now: the start page's conditional-UI autofill would otherwise
    // answer with this credential and verify it as the first factor instead.
    await context.credentials.create(savedCredential.rpId, savedCredential);
    await u.po.signIn.continue();

    await u.po.expect.toBeSignedIn();
  });

  test('lists the passkey under "Use another method"', async ({ page, context }) => {
    await installVirtualAuthenticator(context);

    const u = await signInToSecondFactor(page, context);

    await u.po.signIn.getUseAnotherMethodLink().click();

    const passkeyButton = u.page.getByRole('button', { name: /sign in with your passkey/i });
    await expect(passkeyButton).toBeVisible();
    await expect(u.page.getByRole('button', { name: /send sms code to/i })).toBeVisible();

    await context.credentials.create(savedCredential.rpId, savedCredential);
    await passkeyButton.click();
    await u.po.signIn.continue();

    await u.po.expect.toBeSignedIn();
  });
});
