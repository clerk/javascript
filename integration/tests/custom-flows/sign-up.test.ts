import { parsePublishableKey } from '@clerk/shared/keys';
import { clerkSetup } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils } from '../../testUtils';

test.describe('Custom Flows Sign Up @custom', () => {
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
  });

  test.afterEach(async () => {
    await fakeUser.deleteIfExists();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('can sign up with email and password', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/sign-up');
    await expect(u.page.getByText('Sign up', { exact: true })).toBeVisible();

    await u.po.signUp.signUp({ email: fakeUser.email, password: fakeUser.password });
    // wait for the prepare call to complete
    await u.page.waitForResponse(
      response =>
        response.request().method() === 'POST' &&
        (response.url().includes('prepare_verification') || response.url().includes('prepare_first_factor')),
    );
    await u.page.getByRole('textbox', { name: 'code' }).fill('424242');
    await u.po.signUp.continue();
    await u.page.waitForURL(/protected/);
    await u.po.expect.toBeSignedIn();
  });
});
