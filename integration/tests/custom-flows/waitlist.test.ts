import { parsePublishableKey } from '@clerk/shared/keys';
import { clerkSetup } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

import type { Application } from '../../models/application';
import { hash } from '../../models/helpers';
import { appConfigs } from '../../presets';
import { createTestUtils } from '../../testUtils';

test.describe('Custom Flows Waitlist @custom', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;
  let fakeEmail: string;

  test.beforeAll(async () => {
    app = await appConfigs.customFlows.reactVite.clone().commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withWaitlistMode);
    await app.dev();

    const publishableKey = appConfigs.envs.withWaitlistMode.publicVariables.get('CLERK_PUBLISHABLE_KEY');
    const secretKey = appConfigs.envs.withWaitlistMode.privateVariables.get('CLERK_SECRET_KEY');
    const apiUrl = appConfigs.envs.withWaitlistMode.privateVariables.get('CLERK_API_URL');
    const { frontendApi: frontendApiUrl } = parsePublishableKey(publishableKey);

    await clerkSetup({
      publishableKey,
      frontendApiUrl,
      secretKey,
      // @ts-expect-error
      apiUrl,
      dotenv: false,
    });

    fakeEmail = `${hash()}+clerk_test@clerkcookie.com`;
  });

  test.afterAll(async () => {
    const u = createTestUtils({ app });
    await u.services.waitlist.clearWaitlistByEmail(fakeEmail);
    await app.teardown();
  });

  test('can join waitlist with email', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/waitlist');
    await u.page.waitForClerkJsLoaded();
    await expect(u.page.getByText('Join the Waitlist', { exact: true })).toBeVisible();

    const emailInput = u.page.getByTestId('email-input');
    const submitButton = u.page.getByTestId('submit-button');

    await emailInput.fill(fakeEmail);
    await submitButton.click();

    await expect(u.page.getByText('Successfully joined!')).toBeVisible();
    await expect(u.page.getByText("You're on the waitlist")).toBeVisible();
  });

  test('renders error with invalid email', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/waitlist');
    await u.page.waitForClerkJsLoaded();
    await expect(u.page.getByText('Join the Waitlist', { exact: true })).toBeVisible();

    const emailInput = u.page.getByTestId('email-input');
    const submitButton = u.page.getByTestId('submit-button');

    await emailInput.fill('invalid-email@com');
    await submitButton.click();

    await expect(u.page.getByTestId('email-error')).toBeVisible();
  });

  test('displays loading state while joining', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/waitlist');
    await u.page.waitForClerkJsLoaded();
    await expect(u.page.getByText('Join the Waitlist', { exact: true })).toBeVisible();

    const emailInput = u.page.getByTestId('email-input');
    const submitButton = u.page.getByTestId('submit-button');

    await emailInput.fill(fakeEmail);

    const submitPromise = submitButton.click();

    // Check that button is disabled during fetch
    await expect(submitButton).toBeDisabled();

    await submitPromise;

    // Wait for success state
    await expect(u.page.getByText('Successfully joined!')).toBeVisible();
  });
});
