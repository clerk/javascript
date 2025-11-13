import { parsePublishableKey } from '@clerk/shared/keys';
import { clerkSetup } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';

test.describe('Custom Flows Sign In @custom', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    test.setTimeout(150_000);
    app = await appConfigs.customFlows.reactVite.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodes);
    await app.dev();

    const publishableKey = appConfigs.envs.withEmailCodes.publicVariables.get('CLERK_PUBLISHABLE_KEY');
    const secretKey = appConfigs.envs.withEmailCodes.privateVariables.get('CLERK_SECRET_KEY');
    const apiUrl = appConfigs.envs.withEmailCodes.privateVariables.get('CLERK_API_URL');
    const { frontendApi: frontendApiUrl } = parsePublishableKey(publishableKey);

    await clerkSetup({
      publishableKey,
      frontendApiUrl,
      secretKey,
      // @ts-expect-error
      apiUrl,
      dotenv: false,
    });

    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser({
      fictionalEmail: true,
      withPassword: true,
      withPhoneNumber: true,
      withUsername: true,
    });
    await u.services.users.createBapiUser(fakeUser);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  test('can sign in with email code', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await expect(u.page.getByText('Sign in', { exact: true })).toBeVisible();

    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.page.getByRole('button', { name: 'email_code', exact: true }).click();
    await u.page.getByRole('textbox', { name: 'code' }).fill('424242');
    await u.po.signIn.continue();
    await u.page.waitForURL(/protected/);
    await u.po.expect.toBeSignedIn();
  });

  test('renders error with invalid email code', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await expect(u.page.getByText('Sign in', { exact: true })).toBeVisible();

    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.page.getByRole('button', { name: 'email_code', exact: true }).click();
    await u.page.getByRole('textbox', { name: 'code' }).fill('000000');
    await u.po.signIn.continue();
    await expect(u.page.getByText('is incorrect')).toBeVisible();
  });

  test('can sign in with phone code', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await expect(u.page.getByText('Sign in', { exact: true })).toBeVisible();

    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.page.getByRole('button', { name: 'phone_code', exact: true }).click();
    await u.page.getByRole('textbox', { name: 'code' }).fill('424242');
    await u.po.signIn.continue();
    await u.page.waitForURL(/protected/);
    await u.po.expect.toBeSignedIn();
  });

  test('can sign in with password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-in');
    await expect(u.page.getByText('Sign in', { exact: true })).toBeVisible();

    await u.po.signIn.setIdentifier(fakeUser.email);
    await u.po.signIn.continue();
    await u.page.getByRole('button', { name: 'password', exact: true }).click();
    await u.page.getByRole('textbox', { name: 'password' }).fill(fakeUser.password);
    await u.po.signIn.continue();
    await u.page.waitForURL(/protected/);
    await u.po.expect.toBeSignedIn();
  });
});
