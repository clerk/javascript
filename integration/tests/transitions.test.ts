import { parsePublishableKey } from '@clerk/shared/keys';
import { clerkSetup } from '@clerk/testing/playwright';
import { test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeOrganization, FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

/*
  These tests try to verify some existing transition behaviors. They are not comprehensive, and do not necessarily
  document the desired behavior but the one we currently have, as changing some of these behaviors might be considered
  a breaking change.

  Note that it is unclear if we can support transitions fully for auth state as they involve cookies, which can not fork.

  The tests use organization switching and useAuth as a stand-in for other type of auth state changes and hooks,
  but the strategy and behavior should be the same across other type of state changes and hooks as well and we could
  add more tests to have better coverage.

  We might need to come up with a better strategy to test these behaviors in the future, but this is a start.

  Note that these tests are entangled with the specific page implementation details and so are hard to understand
  without reading the /transitions page code in the template.
*/
testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('transitions @nextjs', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;
  let fakeOrganization: FakeOrganization;
  let fakeOrganization2: FakeOrganization;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });

    const publishableKey = appConfigs.envs.withEmailCodes.publicVariables.get('CLERK_PUBLISHABLE_KEY');
    const secretKey = appConfigs.envs.withEmailCodes.privateVariables.get('CLERK_SECRET_KEY');
    const apiUrl = appConfigs.envs.withEmailCodes.privateVariables.get('CLERK_API_URL');
    const { frontendApi: frontendApiUrl } = parsePublishableKey(publishableKey);

    // Not needed for the normal test setup, but makes it easier to run the tests against a manually started app
    await clerkSetup({
      publishableKey,
      frontendApiUrl,
      secretKey,
      // @ts-expect-error Not typed
      apiUrl,
      dotenv: false,
    });

    fakeUser = u.services.users.createFakeUser();
    const user = await u.services.users.createBapiUser(fakeUser);
    fakeOrganization = await u.services.users.createFakeOrganization(user.id);
    fakeOrganization2 = await u.services.users.createFakeOrganization(user.id);
  });

  test.afterAll(async () => {
    await fakeOrganization.delete();
    await fakeOrganization2.delete();
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  /*
    This test verifies the page behavior when transitions are not involved. State updates immediately and
    already mounted Suspense boundaries are suspended so the fallback shows.

    If Clerk made auth changes as transitions, with full support, the behavior would be that the Suspense fallback
    would not be shown, and orgId would not update until the full transition, including data fetching, was complete.
  */
  test('should switch to the new organization immediately when not using transitions', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

    await u.po.page.goToRelative('/transitions');

    // This page is not using `<ClerkProvider dynamic>`, so orgId should be undefined during page load
    await test.expect(u.po.page.getByTestId('org-id')).toHaveText('undefined');

    await test.expect(u.po.page.getByTestId('org-id')).toHaveText(fakeOrganization2.organization.id);
    // When orgId comes in, this page triggers a mock Suspense fetch
    await test.expect(u.po.page.getByTestId('fetcher-fallback')).toBeVisible();
    await test
      .expect(u.po.page.getByTestId('fetcher-result'))
      .toHaveText(`Fetched value: ${fakeOrganization2.organization.id}`);

    // Switch to new organization
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();
    await u.po.organizationSwitcher.toggleTrigger();
    await test.expect(u.page.locator('.cl-organizationSwitcherPopoverCard')).toBeVisible();
    await u.page.getByText(fakeOrganization.name, { exact: true }).click();

    // When orgId updates, we re-suspend and "fetch" the new value
    await test.expect(u.po.page.getByTestId('org-id')).toHaveText(fakeOrganization.organization.id);
    await test.expect(u.po.page.getByTestId('fetcher-fallback')).toBeVisible();
    await test
      .expect(u.po.page.getByTestId('fetcher-result'))
      .toHaveText(`Fetched value: ${fakeOrganization.organization.id}`);
  });

  /*
    This test verifies that auth state changes interrupt an already started, but unrelated transition, setting
    the state immediately and suspending already mounted Suspense boundaries.

    If Clerk made auth changes as transitions, with full support, the behavior would be that the Suspense fallback
    would not be shown, and orgId would not update until the full transition, including data fetching, was complete.
  */
  test('should switch to the new organization immediately when a transition is in progress', async ({
    page,
    context,
  }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

    await u.po.page.goToRelative('/transitions');

    // This page is not using `<ClerkProvider dynamic>`, so orgId should be undefined during page load
    await test.expect(u.po.page.getByTestId('org-id')).toHaveText('undefined');

    await test.expect(u.po.page.getByTestId('org-id')).toHaveText(fakeOrganization.organization.id);
    // When orgId comes in, this page triggers a mock Suspense fetch
    await test.expect(u.po.page.getByTestId('fetcher-fallback')).toBeVisible();
    await test
      .expect(u.po.page.getByTestId('fetcher-result'))
      .toHaveText(`Fetched value: ${fakeOrganization.organization.id}`);

    // Start unrelated transition
    await u.po.page.getByRole('button', { name: 'Start transition' }).click();
    await test.expect(u.po.page.getByRole('button', { name: 'Finish transition' })).toBeVisible();

    // Switch to new organization
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.waitForAnOrganizationToSelected();
    await u.po.organizationSwitcher.toggleTrigger();
    await test.expect(u.page.locator('.cl-organizationSwitcherPopoverCard')).toBeVisible();
    await u.page.getByText(fakeOrganization2.name, { exact: true }).click();

    // When orgId updates, we re-suspend and "fetch" the new value
    await test.expect(u.po.page.getByTestId('org-id')).toHaveText(fakeOrganization2.organization.id);
    await test.expect(u.po.page.getByTestId('fetcher-fallback')).toBeVisible();
    await test
      .expect(u.po.page.getByTestId('fetcher-result'))
      .toHaveText(`Fetched value: ${fakeOrganization2.organization.id}`);

    // Finish unrelated transition - Should have been pending until now
    await u.po.page.getByRole('button', { name: 'Finish transition' }).click();
    await test.expect(u.po.page.getByRole('button', { name: 'Start transition' })).toBeVisible();
  });

  /*
    This test verifies the current behavior when setActive is triggered inside a transition.

    If setActive/Clerk fully supported transitions, the behavior would be that the Suspense fallback
    would not be shown, and orgId would not update until the full transition, including data fetching, was complete.
  */
  test('should switch to the new organization immediately when triggered inside a transition', async ({
    page,
    context,
  }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });

    await u.po.page.goToRelative('/transitions');

    // This page is not using `<ClerkProvider dynamic>`, so orgId should be undefined during page load
    await test.expect(u.po.page.getByTestId('org-id')).toHaveText('undefined');

    await test.expect(u.po.page.getByTestId('org-id')).toHaveText(fakeOrganization2.organization.id);
    // When orgId comes in, this page triggers a mock Suspense fetch
    await test.expect(u.po.page.getByTestId('fetcher-fallback')).toBeVisible();
    await test
      .expect(u.po.page.getByTestId('fetcher-result'))
      .toHaveText(`Fetched value: ${fakeOrganization2.organization.id}`);

    // Switch to new organization
    await u.po.page.getByRole('button', { name: `Switch to ${fakeOrganization.name} in transition` }).click();
    await test.expect(u.po.page.getByRole('button', { name: `Switching...` })).toBeVisible();

    // When orgId updates, we re-suspend and "fetch" the new value
    await test.expect(u.po.page.getByTestId('org-id')).toHaveText(fakeOrganization.organization.id);
    await test.expect(u.po.page.getByTestId('fetcher-fallback')).toBeVisible();
    await test
      .expect(u.po.page.getByTestId('fetcher-result'))
      .toHaveText(`Fetched value: ${fakeOrganization.organization.id}`);
  });
});
