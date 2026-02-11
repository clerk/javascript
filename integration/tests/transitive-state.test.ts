import { parsePublishableKey } from '@clerk/shared/keys';
import { clerkSetup } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeOrganization, FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

/*
  These tests verify that useAuth emits the correct transitive state sequence when switching
  auth context (org or user) with navigation. The expected pattern is:
  Path A - Value A, Path A - undefined, Path B - undefined, Path B - Value B
*/

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('transitive state @nextjs', ({ app }) => {
  //test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;
  let orgA: FakeOrganization;
  let orgB: FakeOrganization;
  let userA: FakeUser;
  let userB: FakeUser;
  let userAId: string;
  let userBId: string;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });

    const publishableKey = appConfigs.envs.withEmailCodes.publicVariables.get('CLERK_PUBLISHABLE_KEY');
    const secretKey = appConfigs.envs.withEmailCodes.privateVariables.get('CLERK_SECRET_KEY');
    const apiUrl = appConfigs.envs.withEmailCodes.privateVariables.get('CLERK_API_URL');
    const { frontendApi: frontendApiUrl } = parsePublishableKey(publishableKey);

    await clerkSetup({
      publishableKey,
      frontendApiUrl,
      secretKey,
      // @ts-expect-error Not typed
      apiUrl,
      dotenv: false,
    });

    // Org switching test: 1 user with 2 orgs
    fakeUser = u.services.users.createFakeUser();
    const user = await u.services.users.createBapiUser(fakeUser);
    orgB = await u.services.users.createFakeOrganization(user.id);
    orgA = await u.services.users.createFakeOrganization(user.id);

    // User switching test: 2 users for multi-session
    userA = u.services.users.createFakeUser();
    userB = u.services.users.createFakeUser();
    const createdUserA = await u.services.users.createBapiUser(userA);
    const createdUserB = await u.services.users.createBapiUser(userB);
    userAId = createdUserA.id;
    userBId = createdUserB.id;
  });

  test.afterAll(async () => {
    await orgA.delete();
    await orgB.delete();
    await fakeUser.deleteIfExists();
    await userA.deleteIfExists();
    await userB.deleteIfExists();
    await app.teardown();
  });

  test('should emit correct transitive auth state when switching orgs with navigation', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    const pathA = `/transitive-state/organization-switcher/${orgA.organization.id}`;
    const pathB = `/transitive-state/organization-switcher/${orgB.organization.id}`;

    await u.po.page.goToRelative(pathA);

    // Wait for initial state to settle - emission log should contain pathA with orgA
    await test
      .expect(u.po.page.getByTestId('emission-log').locator(`li:has-text("${pathA} - ${orgA.organization.id}")`))
      .toBeVisible();

    // Switch to orgB via OrganizationSwitcher
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();
    await u.po.organizationSwitcher.toggleTrigger();
    await test.expect(u.page.locator('.cl-organizationSwitcherPopoverCard')).toBeVisible();
    await u.page.getByText(orgB.name, { exact: true }).click();

    // Wait for transition to complete - current-org-id shows orgB
    await test.expect(u.po.page.getByTestId('current-org-id')).toHaveText(orgB.organization.id);

    // Assert the emission sequence: last 4 entries are Path A - Org A, Path A - undefined, Path B - undefined, Path B - Org B
    const emissionItems = u.po.page.getByTestId('emission-log').locator('li');
    const count = await emissionItems.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await emissionItems.nth(i).textContent()) ?? '');
    }

    expect(texts.slice(-4)).toEqual([
      `${pathA} - ${orgA.organization.id}`,
      `${pathA} - undefined`,
      `${pathB} - undefined`,
      `${pathB} - ${orgB.organization.id}`,
    ]);
  });

  test('should emit correct transitive auth state when switching users with navigation', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    const pathInitial = '/transitive-state/user-button';
    const pathSwitched = '/transitive-state/user-button/switched';

    // Clear session from previous test
    await context.clearCookies();

    // Sign in as userA
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: userA.email, password: userA.password });
    await u.po.expect.toBeSignedIn();

    // Sign in as userB to create second session (multi-session)
    await u.po.signIn.goTo();
    await u.po.signIn.setIdentifier(userB.email);
    await u.po.signIn.continue();
    await u.po.signIn.setPassword(userB.password);
    await u.po.signIn.continue();

    // Avoid backend rate-limiting on session touch
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Navigate to user-button page (userB is active)
    await u.po.page.goToRelative(pathInitial);

    // Wait for initial state to settle - emission log should contain pathInitial with userB
    await test
      .expect(u.po.page.getByTestId('emission-log').locator(`li:has-text("${pathInitial} - ${userBId}")`))
      .toBeVisible();

    // Switch to userA via UserButton
    await u.po.userButton.waitForMounted();
    await u.po.userButton.toggleTrigger();
    await u.po.userButton.waitForPopover();
    await u.po.userButton.switchAccount(userA.email);
    await u.po.userButton.waitForPopoverClosed();

    // Wait for navigation to switched page
    await test.expect(u.po.page.getByTestId('page-name')).toHaveText('switched');

    // Assert the emission sequence
    const emissionItems = u.po.page.getByTestId('emission-log').locator('li');
    const count = await emissionItems.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await emissionItems.nth(i).textContent()) ?? '');
    }

    expect(texts.slice(-4)).toEqual([
      `${pathInitial} - ${userBId}`,
      `${pathInitial} - undefined`,
      `${pathSwitched} - undefined`,
      `${pathSwitched} - ${userAId}`,
    ]);
  });
});
