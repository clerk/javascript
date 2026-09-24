import type { BrowserContext } from '@playwright/test';
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

test.describe('passkeys @generic', () => {
  test.describe.configure({ mode: 'serial' });

  let app: Application;
  let fakeUser: FakeUser;
  let savedCredential: SavedCredential;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter.commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withPasskeys);
    await app.dev();
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser(test, { fictionalEmail: true, withPassword: true });
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
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
