import { test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withSessionTasks] })(
  'session tasks multi-session flow @nextjs',
  ({ app }) => {
    test.describe.configure({ mode: 'serial' });

    let user1: FakeUser;
    let user2: FakeUser;

    test.beforeAll(async () => {
      const u = createTestUtils({ app });

      user1 = u.services.users.createFakeUser();
      user2 = u.services.users.createFakeUser();

      await u.services.users.createBapiUser(user1);
      await u.services.users.createBapiUser(user2);
    });

    test.afterAll(async () => {
      const u = createTestUtils({ app });
      await user1.deleteIfExists();
      await user2.deleteIfExists();
      await u.services.organizations.deleteAll();
      await app.teardown();
    });

    test('when switching sessions, navigate to task', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });

      // TODO -> Figure out why test is flaky on Next.js 14
      if (u.nextJsVersion === '14') {
        test.skip();
        return;
      }

      // Performs sign-in
      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(user1.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword(user1.password);
      await u.po.signIn.continue();
      await u.po.expect.toBeSignedIn();

      // Resolves task
      const fakeOrganization = Object.assign(u.services.organizations.createFakeOrganization(), {
        slug: u.services.organizations.createFakeOrganization().slug + '-with-session-tasks',
      });

      await u.po.sessionTask.resolveForceOrganizationSelectionTask(fakeOrganization);
      await u.po.expect.toHaveResolvedTask();

      // Navigates to after sign-in
      await u.page.waitForAppUrl('/');

      // Create second user, to initiate a pending session
      // Don't resolve task and switch to active session afterwards
      await u.po.signIn.goTo();
      await u.po.signIn.setIdentifier(user2.email);
      await u.po.signIn.continue();
      await u.po.signIn.setPassword(user2.password);
      await u.po.signIn.continue();

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Select the active session
      await u.page.goToRelative('/');
      await u.po.userButton.waitForMounted();
      await u.po.userButton.toggleTrigger();
      await u.po.userButton.waitForPopover();
      await u.po.userButton.switchAccount(user1.email);
      await u.po.userButton.waitForPopoverClosed();

      // Navigate to protected page, with active session, where user button gets rendered
      await u.page.goToRelative('/user-button');

      // Switch account, to a session that has a pending status
      await u.po.userButton.waitForMounted();
      await u.po.userButton.toggleTrigger();
      await u.po.userButton.waitForPopover();
      await u.po.userButton.toHaveVisibleMenuItems([/Manage account/i, /Sign out$/i]);
      await u.po.userButton.switchAccount(user2.email);
      await u.po.userButton.waitForPopoverClosed();

      // Wait for sign-in component to be mounted after switching accounts
      await u.po.signIn.waitForMounted();
      await page.waitForURL(/tasks/);

      // Resolve task
      const fakeOrganization2 = u.services.organizations.createFakeOrganization();
      await u.po.sessionTask.resolveForceOrganizationSelectionTask(fakeOrganization2);
      await u.po.expect.toHaveResolvedTask();

      // Navigates to after sign-in
      await u.page.waitForAppUrl('/');

      await u.page.signOut();
      await u.page.context().clearCookies();
    });
  },
);
