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

  test('UserProfile API keys uses user ID as subject even when organization is active', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    const admin = await u.services.users.getUser({ email: fakeAdmin.email });
    expect(admin).toBeDefined();
    const userId = admin.id;

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();

    await u.po.organizationSwitcher.goTo();
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

    // Set up request interception to capture the subject parameter
    let capturedSubject: string | null = null;
    await u.page.route('**/api_keys*', async route => {
      const url = new URL(route.request().url());
      capturedSubject = url.searchParams.get('subject');
      await route.continue();
    });

    // Navigate to UserProfile API keys page
    await u.po.page.goToRelative('/user');
    await u.po.userProfile.waitForMounted();
    await u.po.userProfile.switchToAPIKeysTab();

    // Verify the subject parameter is the user ID, not the organization ID
    expect(capturedSubject).toBe(userId);
    expect(capturedSubject).not.toBe(fakeOrganization.organization.id);

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

  test.describe('api key list invalidation', () => {
    // Helper function to count actual API key rows (not empty state)
    const createAPIKeyCountHelper = (u: any) => async () => {
      // Wait for the table to be fully loaded first
      await u.page.locator('.cl-apiKeysTable').waitFor({ timeout: 10000 });

      // Wait for any ongoing navigation/pagination to complete by waiting for network idle
      await u.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
        // Ignore timeout - continue with other checks
      });

      // Wait for content to stabilize - check multiple times to ensure consistency
      let stableCount = -1;
      let retryCount = 0;
      const maxRetries = 10;

      while (retryCount < maxRetries) {
        // Wait for content to load (either empty state or actual data)
        await u.page
          .waitForFunction(
            () => {
              const emptyText = document.querySelector(
                'text[data-localization-key*="emptyRow"], [data-localization-key*="emptyRow"]',
              );
              const menuButtons = document.querySelectorAll(
                '.cl-apiKeysTable .cl-tableBody .cl-tableRow .cl-menuButton',
              );
              const spinner = document.querySelector('.cl-spinner');

              // Content is loaded if we have either empty state, menu buttons, or no spinner
              return emptyText || menuButtons.length > 0 || !spinner;
            },
            { timeout: 3000 },
          )
          .catch(() => {
            // Continue to next check if this fails
          });

        // Check if spinner is still visible (still loading)
        const spinner = u.page.locator('.cl-spinner');
        if (await spinner.isVisible().catch(() => false)) {
          await spinner.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {
            // Continue if spinner doesn't disappear
          });
        }

        // Check for empty state first
        const emptyStateText = await u.page
          .getByText('No API keys found')
          .isVisible()
          .catch(() => false);
        if (emptyStateText) {
          return 0;
        }

        // Count menu buttons (each API key row has one)
        const menuButtons = u.page.locator('.cl-apiKeysTable .cl-tableBody .cl-tableRow .cl-menuButton');
        const currentCount = await menuButtons.count();

        // Check if count has stabilized (same as previous check)
        if (currentCount === stableCount) {
          return currentCount;
        }

        stableCount = currentCount;
        retryCount++;

        // Small delay before next check to allow for DOM updates
        if (retryCount < maxRetries) {
          await u.page.waitForTimeout(200);
        }
      }

      // Return the last stable count if we've exhausted retries
      return stableCount;
    };

    test('api key list invalidation: new key appears immediately after creation', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
      await u.po.expect.toBeSignedIn();

      await u.po.page.goToRelative('/api-keys');
      await u.po.apiKeys.waitForMounted();

      const getAPIKeyCount = createAPIKeyCountHelper(u);
      const initialRowCount = await getAPIKeyCount();

      // Create a new API key with unique name
      const newApiKeyName = `invalidation-test-${Date.now()}`;
      await u.po.apiKeys.clickAddButton();
      await u.po.apiKeys.waitForFormOpened();
      await u.po.apiKeys.typeName(newApiKeyName);
      await u.po.apiKeys.selectExpiration('1d');
      await u.po.apiKeys.clickSaveButton();

      // Close copy modal
      await u.po.apiKeys.waitForCopyModalOpened();
      await u.po.apiKeys.clickCopyAndCloseButton();
      await u.po.apiKeys.waitForCopyModalClosed();
      await u.po.apiKeys.waitForFormClosed();

      // Verify the new API key appears in the list immediately (invalidation worked)
      const table = u.page.locator('.cl-apiKeysTable');
      await expect(table.locator('.cl-tableRow', { hasText: newApiKeyName })).toBeVisible({ timeout: 5000 });

      // Verify the total count increased
      const finalRowCount = await getAPIKeyCount();
      expect(finalRowCount).toBe(initialRowCount + 1);

      // Clean up - revoke the API key created in this test to avoid interfering with other tests
      const menuButton = table.locator('.cl-tableRow', { hasText: newApiKeyName }).locator('.cl-menuButton');
      await menuButton.click();
      const revokeButton = u.page.getByRole('menuitem', { name: 'Revoke key' });
      await revokeButton.click();
      await u.po.apiKeys.waitForRevokeModalOpened();
      await u.po.apiKeys.typeRevokeConfirmation('Revoke');
      await u.po.apiKeys.clickConfirmRevokeButton();
      await u.po.apiKeys.waitForRevokeModalClosed();
    });

    test('api key list invalidation: pagination info updates after creation', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Create a dedicated user for this test to ensure clean state
      const dedicatedUser = u.services.users.createFakeUser();
      const bapiUser = await u.services.users.createBapiUser(dedicatedUser);

      // Create exactly 9 API keys for this user (not using shared organization)
      const existingKeys = await Promise.all(
        Array.from({ length: 9 }, () => u.services.users.createFakeAPIKey(bapiUser.id)),
      );

      // Sign in with the dedicated user
      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: dedicatedUser.email,
        password: dedicatedUser.password,
      });
      await u.po.expect.toBeSignedIn();

      await u.po.page.goToRelative('/api-keys');
      await u.po.apiKeys.waitForMounted();

      const getAPIKeyCount = createAPIKeyCountHelper(u);

      // Verify we have 9 keys and no pagination (all fit in first page)
      // The helper function already has robust waiting logic
      const actualCount = await getAPIKeyCount();
      expect(actualCount).toBe(9);
      await expect(u.page.getByText(/Displaying.*of.*/i)).toBeHidden();

      // Create the 10th API key which should not trigger pagination yet
      const newApiKeyName = `boundary-test-${Date.now()}`;
      await u.po.apiKeys.clickAddButton();
      await u.po.apiKeys.waitForFormOpened();
      await u.po.apiKeys.typeName(newApiKeyName);
      await u.po.apiKeys.selectExpiration('1d');
      await u.po.apiKeys.clickSaveButton();

      await u.po.apiKeys.waitForCopyModalOpened();
      await u.po.apiKeys.clickCopyAndCloseButton();
      await u.po.apiKeys.waitForCopyModalClosed();
      await u.po.apiKeys.waitForFormClosed();

      // Verify we now have 10 keys and still no pagination (exactly fits in one page)
      expect(await getAPIKeyCount()).toBe(10);
      await expect(u.page.getByText(/Displaying.*of.*/i)).toBeHidden();

      // Create the 11th API key which should trigger pagination
      const eleventhKeyName = `pagination-trigger-${Date.now()}`;
      await u.po.apiKeys.clickAddButton();
      await u.po.apiKeys.waitForFormOpened();
      await u.po.apiKeys.typeName(eleventhKeyName);
      await u.po.apiKeys.selectExpiration('1d');
      await u.po.apiKeys.clickSaveButton();

      await u.po.apiKeys.waitForCopyModalOpened();
      await u.po.apiKeys.clickCopyAndCloseButton();
      await u.po.apiKeys.waitForCopyModalClosed();
      await u.po.apiKeys.waitForFormClosed();

      // Verify pagination info appears and shows correct count (invalidation updated pagination)
      await expect(u.page.getByText(/Displaying 1 – 10 of 11/i)).toBeVisible({ timeout: 5000 });
      expect(await getAPIKeyCount()).toBe(10);

      // Cleanup - revoke the API keys created for this test and delete the user
      await Promise.all(existingKeys.map(key => key.revoke()));
      await dedicatedUser.deleteIfExists();
    });

    test('api key list invalidation: works with active search filter', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
      await u.po.expect.toBeSignedIn();

      await u.po.page.goToRelative('/api-keys');
      await u.po.apiKeys.waitForMounted();

      const getAPIKeyCount = createAPIKeyCountHelper(u);

      // Create a specific search term that will match our new key
      const searchTerm = 'search-test';
      const newApiKeyName = `${searchTerm}-${Date.now()}`;

      // Apply search filter first
      const searchInput = u.page.locator('input.cl-apiKeysSearchInput');
      await searchInput.fill(searchTerm);

      // Wait for search to be applied (debounced) - wait for empty state or results
      await u.page.waitForFunction(
        () => {
          const emptyMessage = document.querySelector('[data-localization-key*="emptyRow"]');
          const hasResults =
            document.querySelectorAll('.cl-apiKeysTable .cl-tableBody .cl-tableRow .cl-menuButton').length > 0;
          return emptyMessage || hasResults;
        },
        { timeout: 2000 },
      );

      // Verify no results initially match
      expect(await getAPIKeyCount()).toBe(0);

      // Create API key that matches the search
      await u.po.apiKeys.clickAddButton();
      await u.po.apiKeys.waitForFormOpened();
      await u.po.apiKeys.typeName(newApiKeyName);
      await u.po.apiKeys.selectExpiration('1d');
      await u.po.apiKeys.clickSaveButton();

      await u.po.apiKeys.waitForCopyModalOpened();
      await u.po.apiKeys.clickCopyAndCloseButton();
      await u.po.apiKeys.waitForCopyModalClosed();
      await u.po.apiKeys.waitForFormClosed();

      // Verify the new key appears in filtered results (invalidation worked with search)
      const table = u.page.locator('.cl-apiKeysTable');
      await expect(table.locator('.cl-tableRow', { hasText: newApiKeyName })).toBeVisible({ timeout: 5000 });
      expect(await getAPIKeyCount()).toBe(1);

      // Clear search and verify key appears in full list too
      await searchInput.clear();
      // Wait for search to clear and show all results
      await u.page.waitForFunction(
        () => {
          return document.querySelectorAll('.cl-apiKeysTable .cl-tableBody .cl-tableRow .cl-menuButton').length > 0;
        },
        { timeout: 2000 },
      );
      await expect(table.locator('.cl-tableRow', { hasText: newApiKeyName })).toBeVisible();
    });

    test('api key list invalidation: works when on second page of results', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // Create a dedicated user for this test to ensure clean state
      const dedicatedUser = u.services.users.createFakeUser();
      const bapiUser = await u.services.users.createBapiUser(dedicatedUser);

      // Create exactly 15 API keys for this user to have 2 pages (10 per page)
      const existingKeys = await Promise.all(
        Array.from({ length: 15 }, () => u.services.users.createFakeAPIKey(bapiUser.id)),
      );

      // Sign in with the dedicated user
      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({
        email: dedicatedUser.email,
        password: dedicatedUser.password,
      });
      await u.po.expect.toBeSignedIn();

      await u.po.page.goToRelative('/api-keys');
      await u.po.apiKeys.waitForMounted();

      const getAPIKeyCount = createAPIKeyCountHelper(u);

      // Verify pagination and go to second page
      await expect(u.page.getByText(/Displaying 1 – 10 of 15/i)).toBeVisible();
      const page2Button = u.page.locator('.cl-paginationButton').filter({ hasText: /^2$/ });
      await page2Button.click();
      await expect(u.page.getByText(/Displaying 11 – 15 of 15/i)).toBeVisible();
      expect(await getAPIKeyCount()).toBe(5);

      // Create a new API key while on page 2
      const newApiKeyName = `page2-test-${Date.now()}`;
      await u.po.apiKeys.clickAddButton();
      await u.po.apiKeys.waitForFormOpened();
      await u.po.apiKeys.typeName(newApiKeyName);
      await u.po.apiKeys.selectExpiration('1d');
      await u.po.apiKeys.clickSaveButton();

      await u.po.apiKeys.waitForCopyModalOpened();
      await u.po.apiKeys.clickCopyAndCloseButton();
      await u.po.apiKeys.waitForCopyModalClosed();
      await u.po.apiKeys.waitForFormClosed();

      // Verify pagination info updated (invalidation refreshed all pages)
      await expect(u.page.getByText(/Displaying 11 – 16 of 16/i)).toBeVisible({ timeout: 5000 });
      expect(await getAPIKeyCount()).toBe(6);

      // The new key should appear on page 1 since it's the most recent
      const table = u.page.locator('.cl-apiKeysTable');
      await expect(table.locator('.cl-tableRow', { hasText: newApiKeyName })).toBeVisible();

      // Cleanup - revoke the API keys created for this test and delete the user
      await Promise.all(existingKeys.map(key => key.revoke()));
      await dedicatedUser.deleteIfExists();
    });

    test('api key list invalidation: multiple rapid creations update correctly', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.po.signIn.goTo();
      await u.po.signIn.waitForMounted();
      await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
      await u.po.expect.toBeSignedIn();

      await u.po.page.goToRelative('/api-keys');
      await u.po.apiKeys.waitForMounted();

      const getAPIKeyCount = createAPIKeyCountHelper(u);
      const initialRowCount = await getAPIKeyCount();
      const timestamp = Date.now();

      // Create multiple API keys rapidly to test invalidation handles concurrent updates
      for (let i = 0; i < 3; i++) {
        const keyName = `rapid-test-${timestamp}-${i}`;

        await u.po.apiKeys.clickAddButton();
        await u.po.apiKeys.waitForFormOpened();
        await u.po.apiKeys.typeName(keyName);
        await u.po.apiKeys.selectExpiration('1d');
        await u.po.apiKeys.clickSaveButton();

        await u.po.apiKeys.waitForCopyModalOpened();
        await u.po.apiKeys.clickCopyAndCloseButton();
        await u.po.apiKeys.waitForCopyModalClosed();
        await u.po.apiKeys.waitForFormClosed();
      }

      // Verify all 3 new keys appear in the list
      const table = u.page.locator('.cl-apiKeysTable');
      for (let i = 0; i < 3; i++) {
        const keyName = `rapid-test-${timestamp}-${i}`;
        await expect(table.locator('.cl-tableRow', { hasText: keyName })).toBeVisible({ timeout: 5000 });
      }

      // Verify total count increased by 3
      const finalRowCount = await getAPIKeyCount();
      expect(finalRowCount).toBe(initialRowCount + 3);

      // Clean up - revoke the API keys created in this test to avoid interfering with other tests
      for (let i = 0; i < 3; i++) {
        const keyName = `rapid-test-${timestamp}-${i}`;
        const menuButton = table.locator('.cl-tableRow', { hasText: keyName }).locator('.cl-menuButton');
        await menuButton.click();
        const revokeButton = u.page.getByRole('menuitem', { name: 'Revoke key' });
        await revokeButton.click();
        await u.po.apiKeys.waitForRevokeModalOpened();
        await u.po.apiKeys.typeRevokeConfirmation('Revoke');
        await u.po.apiKeys.clickConfirmRevokeButton();
        await u.po.apiKeys.waitForRevokeModalClosed();
      }
    });
  });
});
