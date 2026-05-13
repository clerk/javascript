import { clerk } from '@clerk/testing/playwright';

import { appConfigs } from '../../presets';
import type { FakeUser } from '../../testUtils/usersService';
import { test, expect } from './fixtures';
import { createTestUser, getAuthFromBackground } from './helpers';

test.describe('chrome extension background service worker @chrome-extension', () => {
  test.describe.configure({ mode: 'serial' });

  const env = appConfigs.envs.withEmailCodes;
  let fakeUser: FakeUser;

  test.beforeAll(async () => {
    fakeUser = await createTestUser(env);
  });

  test.afterAll(async () => {
    await fakeUser.deleteIfExists();
  });

  test('background service worker receives auth state after sign in', async ({ extensionPage }) => {
    await clerk.signIn({
      page: extensionPage,
      signInParams: { strategy: 'password', identifier: fakeUser.email, password: fakeUser.password },
    });

    const authState = await getAuthFromBackground(extensionPage);

    expect(authState.userId).toBeTruthy();
    expect(authState.userId).toMatch(/^user_/);
    expect(authState.sessionId).toBeTruthy();
    expect(authState.sessionId).toMatch(/^sess_/);
  });

  test('background service worker returns null auth when signed out', async ({ extensionPage }) => {
    // The extension page starts in a fresh context (signed out)
    await clerk.loaded({ page: extensionPage });

    const authState = await getAuthFromBackground(extensionPage);

    expect(authState.userId).toBeNull();
    expect(authState.sessionId).toBeNull();
  });
});
