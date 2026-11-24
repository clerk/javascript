import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('unsafeMetadata @nextjs', ({ app }) => {
  test.describe.configure({ mode: 'parallel' });

  test.afterAll(async () => {
    await app.teardown();
  });

  test('sign up persists unsafeMetadata', async ({ page, context }) => {
    const u = await createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser(test, {
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });

    // Go to sign up page
    await u.po.signUp.goTo();

    // Fill in sign up form
    await u.po.signUp.signUpWithEmailAndPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });

    // Verify email
    await u.po.signUp.enterTestOtpCode();

    // Check if user is signed in
    await u.po.expect.toBeSignedIn();

    const user = await u.services.users.getUser({ email: fakeUser.email });
    expect(user?.unsafeMetadata).toEqual({ position: 'goalie' });

    await fakeUser.deleteIfExists();
  });

  test('combined sign up persists unsafeMetadata', async ({ page, context }) => {
    const u = await createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser(test, {
      fictionalEmail: true,
      withPassword: true,
      withUsername: true,
    });

    await u.page.goToRelative('/sign-in-or-up');
    await u.po.signIn.setIdentifier(fakeUser.username);
    await u.po.signIn.continue();
    await u.page.waitForAppUrl('/sign-in-or-up/create');

    const prefilledUsername = u.po.signUp.getUsernameInput();
    await expect(prefilledUsername).toHaveValue(fakeUser.username);

    await u.po.signUp.setEmailAddress(fakeUser.email);
    await u.po.signUp.setPassword(fakeUser.password);
    await u.po.signUp.continue();

    await u.po.signUp.enterTestOtpCode();

    await u.po.expect.toBeSignedIn();

    const user = await u.services.users.getUser({ email: fakeUser.email });
    expect(user?.unsafeMetadata).toEqual({ position: 'goalie' });

    await fakeUser.deleteIfExists();
  });

  // Helper: sign up a user via the UI and return the BAPI user id once the
  // client session is established. Mirrors the existing sign-up test flow so
  // these specs share the same baseline (`unsafeMetadata: { position: 'goalie' }`).
  const signUpAndGetUser = async ({ page, context }: { page: any; context: any }) => {
    const u = await createTestUtils({ app, page, context });
    const fakeUser = u.services.users.createFakeUser(test, {
      fictionalEmail: true,
      withPhoneNumber: true,
      withUsername: true,
    });

    await u.po.signUp.goTo();
    await u.po.signUp.signUpWithEmailAndPassword({
      email: fakeUser.email,
      password: fakeUser.password,
    });
    await u.po.signUp.enterTestOtpCode();
    await u.po.expect.toBeSignedIn();

    const bapiUser = await u.services.users.getUser({ email: fakeUser.email });
    expect(bapiUser?.unsafeMetadata).toEqual({ position: 'goalie' });

    return { u, fakeUser, bapiUser: bapiUser! };
  };

  test('user.update({ unsafeMetadata }) preserves replace semantics end-to-end', async ({ page, context }) => {
    const { u, fakeUser, bapiUser } = await signUpAndGetUser({ page, context });

    // Drive the deprecated path from the browser. The SDK routes metadata
    // through PUT /v1/me/metadata; the server-side outcome must be a true
    // replace (the original `position` key is gone).
    await page.evaluate(async () => {
      await window.Clerk.user.update({ unsafeMetadata: { city: 'Toronto' } });
    });

    const refreshed = await u.services.users.getUser({ id: bapiUser.id });
    expect(refreshed?.unsafeMetadata).toEqual({ city: 'Toronto' });

    await fakeUser.deleteIfExists();
  });

  test('user.updateMetadata({ unsafeMetadata }) deep-merges (recommended path)', async ({ page, context }) => {
    const { u, fakeUser, bapiUser } = await signUpAndGetUser({ page, context });

    // The recommended migration target. Unlike `update(...)`, this is a
    // partial update — the original `position` key must survive.
    await page.evaluate(async () => {
      await window.Clerk.user.updateMetadata({ unsafeMetadata: { city: 'Toronto' } });
    });

    const refreshed = await u.services.users.getUser({ id: bapiUser.id });
    expect(refreshed?.unsafeMetadata).toEqual({ position: 'goalie', city: 'Toronto' });

    await fakeUser.deleteIfExists();
  });

  test('user.update with metadata + non-metadata fields persists both', async ({ page, context }) => {
    const { u, fakeUser, bapiUser } = await signUpAndGetUser({ page, context });

    // Mixed call: PATCH /v1/me for the non-metadata field, then
    // PUT /v1/me/metadata for the metadata. Both must land.
    await page.evaluate(async () => {
      await window.Clerk.user.update({
        firstName: 'Updated',
        unsafeMetadata: { city: 'Toronto' },
      });
    });

    const refreshed = await u.services.users.getUser({ id: bapiUser.id });
    expect(refreshed?.firstName).toBe('Updated');
    expect(refreshed?.unsafeMetadata).toEqual({ city: 'Toronto' });

    await fakeUser.deleteIfExists();
  });

  test('user.update replaces server-side mutations the browser has not seen', async ({ page, context }) => {
    const { u, fakeUser, bapiUser } = await signUpAndGetUser({ page, context });

    // Simulate a server-side mutation made by *another* actor
    // after the browser cached the user.
    // The browser's local `unsafeMetadata` is now stale,
    // missing the `adminAdded` key.
    await u.services.clerk.users.updateUserMetadata(bapiUser.id, {
      unsafeMetadata: { adminAdded: 'yes' },
    });

    // From the browser, call the deprecated path with replace intent.
    // The server-side `adminAdded` key must be gone too.
    await page.evaluate(async () => {
      await window.Clerk.user.update({ unsafeMetadata: { city: 'Toronto' } });
    });

    const refreshed = await u.services.users.getUser({ id: bapiUser.id });
    expect(refreshed?.unsafeMetadata).toEqual({ city: 'Toronto' });

    await fakeUser.deleteIfExists();
  });
});
