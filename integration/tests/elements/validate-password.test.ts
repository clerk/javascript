import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('Password Validation @elements', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

  test.afterAll(async () => {
    await app.teardown();
  });

  test.beforeEach(async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.page.goToRelative('/validate-password');
  });

  test('should have initial "idle" state', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await expect(u.po.signIn.getPasswordInput()).toHaveAttribute('data-state', 'idle');
    await expect(page.getByTestId('state')).toHaveText('idle');
  });

  test('should change state to "info" on focus', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.getPasswordInput().focus();

    await expect(page.getByTestId('state')).toHaveText('info');
  });

  test('should return codes and message with non-idle state', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.getPasswordInput().focus();

    await expect(page.getByTestId('codes')).toHaveText(/min_length/);
    await expect(page.getByTestId('message')).toHaveText('Your password must contain 8 or more characters.');
  });

  test('should return error when requirements are not met', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.setPassword('12345678');

    await expect(page.getByTestId('state')).toHaveText('error');
    await expect(page.getByTestId('codes')).toHaveText(/require_special_char/);
    await expect(page.getByTestId('message')).toHaveText('Your password must contain a special character.');
  });

  test('should return success when requirements are met', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.setPassword('12345678@');

    await expect(page.getByTestId('state')).toHaveText('success');
    await expect(page.getByTestId('codes')).toHaveText('');
    await expect(page.getByTestId('message')).toHaveText('Your password meets all the necessary requirements.');
  });

  test('should have working flow', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await expect(page.getByTestId('state')).toHaveText('idle');
    await u.po.signIn.setPassword('123');
    await expect(page.getByTestId('state')).toHaveText('info');
    await u.po.signIn.setPassword('12345678');
    await expect(page.getByTestId('state')).toHaveText('error');
    await u.po.signIn.setPassword('12345678@');
    await expect(page.getByTestId('state')).toHaveText('success');
  });
});
