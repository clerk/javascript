import { expect, test } from '@playwright/test';
import { parsePublishableKey } from '@clerk/shared/keys';
import { clerkSetup } from '@clerk/testing/playwright';

import type { Application } from '../../models/application';
import { appConfigs } from '../../presets';
import { createTestUtils, FakeUser } from '../../testUtils';

test.describe('Custom Flows Waitlist @custom', () => {
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
    });
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('can join waitlist with email', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/waitlist');
    await expect(u.page.getByText('Join the Waitlist', { exact: true })).toBeVisible();

    const emailInput = u.page.getByTestId('email-input');
    const submitButton = u.page.getByTestId('submit-button');

    await emailInput.fill(fakeUser.email);
    await submitButton.click();

    await expect(u.page.getByText('Successfully joined!')).toBeVisible();
    await expect(u.page.getByText("You're on the waitlist")).toBeVisible();
  });

  test('renders error with invalid email', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/waitlist');
    await expect(u.page.getByText('Join the Waitlist', { exact: true })).toBeVisible();

    const emailInput = u.page.getByTestId('email-input');
    const submitButton = u.page.getByTestId('submit-button');

    await emailInput.fill('invalid-email');
    await submitButton.click();

    await expect(u.page.getByTestId('email-error')).toBeVisible();
  });

  test('displays loading state while joining', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/waitlist');
    await expect(u.page.getByText('Join the Waitlist', { exact: true })).toBeVisible();

    const emailInput = u.page.getByTestId('email-input');
    const submitButton = u.page.getByTestId('submit-button');

    await emailInput.fill(fakeUser.email);
    
    const submitPromise = submitButton.click();
    
    // Check that button is disabled during fetch
    await expect(submitButton).toBeDisabled();
    
    await submitPromise;
    
    // Wait for success state
    await expect(u.page.getByText('Successfully joined!')).toBeVisible();
  });

  test('can navigate to sign-in from waitlist', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/waitlist');
    await expect(u.page.getByText('Join the Waitlist', { exact: true })).toBeVisible();

    const signInLink = u.page.getByTestId('sign-in-link');
    await expect(signInLink).toBeVisible();
    await signInLink.click();

    await expect(u.page.getByText('Sign in', { exact: true })).toBeVisible();
    await u.page.waitForURL(/sign-in/);
  });

  test('waitlist hook provides correct properties', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/waitlist');

    // Check initial state - waitlist resource should be available but empty
    const emailInput = u.page.getByTestId('email-input');
    const submitButton = u.page.getByTestId('submit-button');
    
    await expect(emailInput).toBeVisible();
    await expect(submitButton).toBeEnabled();
    
    // Join waitlist
    await emailInput.fill(fakeUser.email);
    await submitButton.click();
    
    // After successful join, the component should show success state
    await expect(u.page.getByText('Successfully joined!')).toBeVisible();
  });
});
