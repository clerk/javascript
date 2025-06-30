import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withAPIKeys] })('api keys @generic', ({ app }) => {
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

  test('can create api keys', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.po.page.goToRelative('/api-keys');
    await u.po.apiKeys.waitForMounted();

    // Create API key 1
    await u.po.apiKeys.clickAddButton();
    await u.po.apiKeys.waitForFormOpened();
    await u.po.apiKeys.typeName(`${fakeUser.firstName}-api-key-1`);
    await u.po.apiKeys.selectExpiration('1d');
    await u.po.apiKeys.clickSaveButton();

    await u.po.apiKeys.waitForFormClosed();

    // Create API key 2
    await u.po.apiKeys.clickAddButton();
    await u.po.apiKeys.waitForFormOpened();
    await u.po.apiKeys.typeName(`${fakeUser.firstName}-api-key-2`);
    await u.po.apiKeys.selectExpiration('7d');
    await u.po.apiKeys.clickSaveButton();

    // Check if both API keys are created
    await expect(u.page.locator('.cl-apiKeysTable .cl-tableRow')).toHaveCount(2);
  });

  test('can revoke api keys', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.po.page.goToRelative('/api-keys');
    await u.po.apiKeys.waitForMounted();

    const apiKeyName = `${fakeUser.firstName}-${Date.now()}`;

    // Create API key
    await u.po.apiKeys.clickAddButton();
    await u.po.apiKeys.waitForFormOpened();
    await u.po.apiKeys.typeName(apiKeyName);
    await u.po.apiKeys.selectExpiration('1d');
    await u.po.apiKeys.clickSaveButton();
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

  test('can copy api key secret', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.po.page.goToRelative('/api-keys');
    await u.po.apiKeys.waitForMounted();

    const apiKeyName = `${fakeUser.firstName}-${Date.now()}`;

    // Create API key
    await u.po.apiKeys.clickAddButton();
    await u.po.apiKeys.waitForFormOpened();
    await u.po.apiKeys.typeName(apiKeyName);
    await u.po.apiKeys.selectExpiration('1d');
    await u.po.apiKeys.clickSaveButton();
    await u.po.apiKeys.waitForFormClosed();

    const responsePromise = page.waitForResponse(
      response => response.url().includes('/secret') && response.request().method() === 'GET',
    );

    // Copy API key
    const table = u.page.locator('.cl-apiKeysTable');
    const row = table.locator('.cl-tableRow', { hasText: apiKeyName });
    await row.waitFor({ state: 'attached' });
    await row.locator('.cl-apiKeysCopyButton').click();

    // Read clipboard contents
    const data = await (await responsePromise).json();
    await context.grantPermissions(['clipboard-read']);
    const clipboardText = await page.evaluate('navigator.clipboard.readText()');
    await context.clearPermissions();
    expect(clipboardText).toBe(data.secret);
  });

  test('can toggle api key secret visibility', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.po.page.goToRelative('/api-keys');
    await u.po.apiKeys.waitForMounted();

    const apiKeyName = `${fakeUser.firstName}-${Date.now()}`;

    // Create API key
    await u.po.apiKeys.clickAddButton();
    await u.po.apiKeys.waitForFormOpened();
    await u.po.apiKeys.typeName(apiKeyName);
    await u.po.apiKeys.selectExpiration('1d');
    await u.po.apiKeys.clickSaveButton();
    await u.po.apiKeys.waitForFormClosed();

    const responsePromise = page.waitForResponse(
      response => response.url().includes('/secret') && response.request().method() === 'GET',
    );

    // Toggle API key secret visibility
    const table = u.page.locator('.cl-apiKeysTable');
    const row = table.locator('.cl-tableRow', { hasText: apiKeyName });
    await row.waitFor({ state: 'attached' });
    await expect(row.locator('input')).toHaveAttribute('type', 'password');
    await row.locator('.cl-apiKeysRevealButton').click();

    // Verify if secret matches the input value
    const data = await (await responsePromise).json();
    await expect(row.locator('input')).toHaveAttribute('type', 'text');
    await expect(row.locator('input')).toHaveValue(data.secret);

    // Toggle visibility off
    await row.locator('.cl-apiKeysRevealButton').click();
    await expect(row.locator('input')).toHaveAttribute('type', 'password');
  });
});
