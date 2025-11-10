import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeOrganization, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

const mockAPIKeysEnvironmentSettings = async (
  page: Page,
  overrides: Partial<{
    user_api_keys_enabled: boolean;
    orgs_api_keys_enabled: boolean;
  }>,
) => {
  await page.route('*/**/v1/environment*', async route => {
    const response = await route.fetch();
    const json = await response.json();
    const newJson = {
      ...json,
      api_keys_settings: {
        user_api_keys_enabled: true,
        orgs_api_keys_enabled: true,
        ...overrides,
      },
    };
    await route.fulfill({ response, json: newJson });
  });
};

testAgainstRunningApps({
  withEnv: [appConfigs.envs.withAPIKeys],
  withPattern: ['withMachine.next.appRouter'],
})('api keys component @xmachine', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeAdmin: FakeUser;
  let fakeOrganization: FakeOrganization;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeAdmin = u.services.users.createFakeUser();
    const admin = await u.services.users.createBapiUser(fakeAdmin);
    fakeOrganization = await u.services.users.createFakeOrganization(admin.id);
  });

  test.afterAll(async () => {
    await fakeOrganization.delete();
    await fakeAdmin.deleteIfExists();
    await app.teardown();
  });

  test('can create api keys', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();

    await u.po.page.goToRelative('/api-keys');
    await u.po.apiKeys.waitForMounted();

    // Create API key 1
    await u.po.apiKeys.clickAddButton();
    await u.po.apiKeys.waitForFormOpened();
    await u.po.apiKeys.typeName(`${fakeAdmin.firstName}-api-key-1`);
    await u.po.apiKeys.selectExpiration('1d');
    await u.po.apiKeys.clickSaveButton();

    // Close copy modal
    await u.po.apiKeys.waitForCopyModalOpened();
    await u.po.apiKeys.clickCopyAndCloseButton();
    await u.po.apiKeys.waitForCopyModalClosed();
    await u.po.apiKeys.waitForFormClosed();

    // Create API key 2
    await u.po.apiKeys.clickAddButton();
    await u.po.apiKeys.waitForFormOpened();
    await u.po.apiKeys.typeName(`${fakeAdmin.firstName}-api-key-2`);
    await u.po.apiKeys.selectExpiration('7d');
    await u.po.apiKeys.clickSaveButton();

    // Wait and close copy modal
    await u.po.apiKeys.waitForCopyModalOpened();
    await u.po.apiKeys.clickCopyAndCloseButton();
    await u.po.apiKeys.waitForCopyModalClosed();
    await u.po.apiKeys.waitForFormClosed();

    // Check if both API keys are created
    await expect(u.page.locator('.cl-apiKeysTable .cl-tableBody .cl-tableRow')).toHaveCount(2);
  });

  test('pagination works correctly with multiple pages', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    // Create user and 11 API keys to trigger pagination (default perPage is 10)
    const fakeUser = u.services.users.createFakeUser();
    const bapiUser = await u.services.users.createBapiUser(fakeUser);
    const fakeAPIKeys = await Promise.all(
      Array.from({ length: 11 }, () => u.services.users.createFakeAPIKey(bapiUser.id)),
    );

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.po.page.goToRelative('/api-keys');
    await u.po.apiKeys.waitForMounted();

    // Verify first page
    await expect(u.page.getByText(/Displaying 1 – 10 of 11/i)).toBeVisible();
    await expect(u.page.locator('.cl-apiKeysTable .cl-tableBody .cl-tableRow')).toHaveCount(10);

    // Navigate to second page
    const page2Button = u.page.locator('.cl-paginationButton').filter({ hasText: /^2$/ });
    await page2Button.click();
    await expect(u.page.getByText(/Displaying 11 – 11 of 11/i)).toBeVisible();
    await expect(u.page.locator('.cl-apiKeysTable .cl-tableBody .cl-tableRow')).toHaveCount(1);

    // Navigate back to first page
    const page1Button = u.page.locator('.cl-paginationButton').filter({ hasText: /^1$/ });
    await page1Button.click();
    await expect(u.page.getByText(/Displaying 1 – 10 of 11/i)).toBeVisible();
    await expect(u.page.locator('.cl-apiKeysTable .cl-tableBody .cl-tableRow')).toHaveCount(10);

    // Cleanup
    await Promise.all(fakeAPIKeys.map(key => key.revoke()));
    await fakeUser.deleteIfExists();
  });

  test('pagination does not show when items fit in one page', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();

    await u.po.page.goToRelative('/api-keys');
    await u.po.apiKeys.waitForMounted();

    const apiKeyName = `${fakeAdmin.firstName}-single-page-${Date.now()}`;
    await u.po.apiKeys.clickAddButton();
    await u.po.apiKeys.waitForFormOpened();
    await u.po.apiKeys.typeName(apiKeyName);
    await u.po.apiKeys.selectExpiration('1d');
    await u.po.apiKeys.clickSaveButton();

    await u.po.apiKeys.waitForCopyModalOpened();
    await u.po.apiKeys.clickCopyAndCloseButton();
    await u.po.apiKeys.waitForCopyModalClosed();
    await u.po.apiKeys.waitForFormClosed();

    await expect(u.page.getByText(/Displaying.*of.*/i)).toBeHidden();
  });

  test('can revoke api keys', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();

    await u.po.page.goToRelative('/api-keys');
    await u.po.apiKeys.waitForMounted();

    const apiKeyName = `${fakeAdmin.firstName}-${Date.now()}`;

    // Create API key
    await u.po.apiKeys.clickAddButton();
    await u.po.apiKeys.waitForFormOpened();
    await u.po.apiKeys.typeName(apiKeyName);
    await u.po.apiKeys.selectExpiration('1d');
    await u.po.apiKeys.clickSaveButton();

    // Wait and close copy modal
    await u.po.apiKeys.waitForCopyModalOpened();
    await u.po.apiKeys.clickCopyAndCloseButton();
    await u.po.apiKeys.waitForCopyModalClosed();
    await u.po.apiKeys.waitForFormClosed();

    // Retrieve API key
    const table = u.page.locator('.cl-apiKeysTable');
    const row = table.locator('.cl-tableRow', { hasText: apiKeyName });
    await row.waitFor({ state: 'attached' });

    // Revoke API key
    await row.locator('.cl-menuButton').click();
    const revokeButton = u.page.getByRole('menuitem', { name: 'Revoke key' });
    await revokeButton.waitFor({ state: 'attached' });
    await revokeButton.click();

    // Wait for revoke modal and confirm revocation
    await u.po.apiKeys.waitForRevokeModalOpened();
    await u.po.apiKeys.typeRevokeConfirmation('Revoke');
    await u.po.apiKeys.clickConfirmRevokeButton();
    await u.po.apiKeys.waitForRevokeModalClosed();

    // Check if record is removed from the table
    await expect(table.locator('.cl-tableRow', { hasText: apiKeyName })).toHaveCount(0);
  });

  test('can copy api key secret after creation', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();

    await u.po.page.goToRelative('/api-keys');
    await u.po.apiKeys.waitForMounted();

    const apiKeyName = `${fakeAdmin.firstName}-${Date.now()}`;

    // Create API key and capture the secret from the response
    const createResponsePromise = page.waitForResponse(
      response => response.url().includes('/api_keys') && response.request().method() === 'POST',
    );
    await u.po.apiKeys.clickAddButton();
    await u.po.apiKeys.waitForFormOpened();
    await u.po.apiKeys.typeName(apiKeyName);
    await u.po.apiKeys.selectExpiration('1d');
    await u.po.apiKeys.clickSaveButton();

    const createResponse = await createResponsePromise;
    const secret = (await createResponse.json()).secret;

    // Copy secret via modal and verify clipboard contents
    // Wait and close copy modal
    await u.po.apiKeys.waitForCopyModalOpened();
    await context.grantPermissions(['clipboard-read']);
    await u.po.apiKeys.clickCopyAndCloseButton();
    await u.po.apiKeys.waitForCopyModalClosed();
    await u.po.apiKeys.waitForFormClosed();

    const clipboardText = await page.evaluate('navigator.clipboard.readText()');
    await context.clearPermissions();
    expect(clipboardText).toBe(secret);
  });

  test('UserProfile API keys page visibility', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();

    // user_api_keys_enabled: false should hide API keys page
    await mockAPIKeysEnvironmentSettings(u.page, { user_api_keys_enabled: false });
    await u.po.page.goToRelative('/user');
    await u.po.userProfile.waitForMounted();
    await u.po.page.goToRelative('/user#/api-keys');
    await expect(u.page.locator('.cl-apiKeys')).toBeHidden({ timeout: 2000 });

    // user_api_keys_enabled: true should show API keys page
    await mockAPIKeysEnvironmentSettings(u.page, { user_api_keys_enabled: true });
    await page.reload();
    await u.po.userProfile.waitForMounted();
    await u.po.page.goToRelative('/user#/api-keys');
    await expect(u.page.locator('.cl-apiKeys')).toBeVisible({ timeout: 5000 });

    await u.page.unrouteAll();
  });

  test('OrganizationProfile API keys page visibility', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();

    // orgs_api_keys_enabled: false should hide API keys page
    await mockAPIKeysEnvironmentSettings(u.page, { orgs_api_keys_enabled: false });
    await u.po.page.goToRelative('/organization-profile');
    await u.po.page.goToRelative('/organization-profile#/organization-api-keys');
    await expect(u.page.locator('.cl-apiKeys')).toBeHidden({ timeout: 2000 });

    // orgs_api_keys_enabled: true should show API keys page
    await mockAPIKeysEnvironmentSettings(u.page, { orgs_api_keys_enabled: true });
    await page.reload();
    await u.po.page.goToRelative('/organization-profile#/organization-api-keys');
    await expect(u.page.locator('.cl-apiKeys')).toBeVisible({ timeout: 5000 });

    await u.page.unrouteAll();
  });

  test('standalone API keys component in user context based on user_api_keys_enabled', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();

    // user_api_keys_enabled: false should prevent standalone component from rendering
    await mockAPIKeysEnvironmentSettings(u.page, { user_api_keys_enabled: false });

    let apiKeysRequestWasMade = false;
    await u.page.route('**/api_keys*', async route => {
      apiKeysRequestWasMade = true;
      await route.abort();
    });

    await u.po.page.goToRelative('/api-keys');
    await expect(u.page.locator('.cl-apiKeys-root')).toBeHidden({ timeout: 1000 });
    expect(apiKeysRequestWasMade).toBe(false);

    // user_api_keys_enabled: true should allow standalone component to render
    await mockAPIKeysEnvironmentSettings(u.page, { user_api_keys_enabled: true });
    await page.reload();
    await u.po.apiKeys.waitForMounted();
    await expect(u.page.locator('.cl-apiKeys-root')).toBeVisible();

    await u.page.unrouteAll();
  });

  test('standalone API keys component in org context based on orgs_api_keys_enabled', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();

    // orgs_api_keys_enabled: false should prevent standalone component from rendering in org context
    await mockAPIKeysEnvironmentSettings(u.page, { orgs_api_keys_enabled: false });

    let apiKeysRequestWasMade = false;
    await u.page.route('**/api_keys*', async route => {
      apiKeysRequestWasMade = true;
      await route.abort();
    });

    await u.po.page.goToRelative('/api-keys');
    await expect(u.page.locator('.cl-apiKeys-root')).toBeHidden({ timeout: 1000 });
    expect(apiKeysRequestWasMade).toBe(false);

    // orgs_api_keys_enabled: true should allow standalone component to render in org context
    await mockAPIKeysEnvironmentSettings(u.page, { orgs_api_keys_enabled: true });
    await page.reload();
    await u.po.apiKeys.waitForMounted();
    await expect(u.page.locator('.cl-apiKeys-root')).toBeVisible();

    await u.page.unrouteAll();
  });
});
