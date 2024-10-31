import type { OrganizationMembershipRole } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeOrganization, FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

const utils = [
  'action',
  // , 'route'
];
const capitalize = (type: string) => type[0].toUpperCase() + type.slice(1);
testAgainstRunningApps({ withEnv: [appConfigs.envs.withReverification] })(
  '@nextjs require re-verification',
  ({ app }) => {
    test.describe.configure({ mode: 'parallel' });

    let fakeAdmin: FakeUser;
    let fakeViewer: FakeUser;
    let fakeOrganization: FakeOrganization;

    test.beforeAll(async () => {
      const m = createTestUtils({ app });
      fakeAdmin = m.services.users.createFakeUser();
      const admin = await m.services.users.createBapiUser(fakeAdmin);
      fakeOrganization = await m.services.users.createFakeOrganization(admin.id);
      fakeViewer = m.services.users.createFakeUser();
      const viewer = await m.services.users.createBapiUser(fakeViewer);
      await m.services.clerk.organizations.createOrganizationMembership({
        organizationId: fakeOrganization.organization.id,
        role: 'org:viewer' as OrganizationMembershipRole,
        userId: viewer.id,
      });
    });

    test.afterAll(async () => {
      await fakeOrganization.delete();
      await fakeViewer.deleteIfExists();
      await fakeAdmin.deleteIfExists();
      await app.teardown();
    });

    utils.forEach(type => {
      test(`reverification error from ${capitalize(type)}`, async ({ page, context }) => {
        test.setTimeout(270_000);
        const u = createTestUtils({ app, page, context });

        await u.po.signIn.goTo();
        await u.po.signIn.waitForMounted();
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
        await u.po.expect.toBeSignedIn();

        await u.po.organizationSwitcher.goTo();
        await u.po.organizationSwitcher.waitForMounted();
        await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

        await u.page.goToRelative(`/requires-re-verification`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(u.page.getByText(/\{\s*"userId"\s*:\s*"user_[^"]+"\s*\}/i)).toBeVisible();

        const total = 1000 * 120;
        await page.waitForTimeout(total / 3);
        await page.waitForTimeout(total / 3);
        await u.po.userProfile.goTo();
        await page.waitForTimeout(total / 3);
        await u.page.goToRelative(`/requires-re-verification`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(
          u.page.getByText(
            /\{\s*"clerk_error"\s*:\s*\{\s*"type"\s*:\s*"forbidden"\s*,\s*"reason"\s*:\s*"reverification-mismatch"\s*,\s*"metadata"\s*:\s*\{\s*"reverification"\s*:\s*\{\s*"level"\s*:\s*"secondFactor"\s*,\s*"afterMinutes"\s*:\s*1\s*\}\s*\}\s*\}\s*\}/i,
          ),
        ).toBeVisible();
      });

      test(`reverification recovery from ${capitalize(type)}`, async ({ page, context }) => {
        test.setTimeout(270_000);
        const u = createTestUtils({ app, page, context });

        await u.po.signIn.goTo();
        await u.po.signIn.waitForMounted();
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
        await u.po.expect.toBeSignedIn();

        await u.po.organizationSwitcher.goTo();
        await u.po.organizationSwitcher.waitForMounted();
        await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

        await u.page.goToRelative(`/requires-re-verification`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(u.page.getByText(/\{\s*"userId"\s*:\s*"user_[^"]+"\s*\}/i)).toBeVisible();

        const total = 1000 * 120;
        await page.waitForTimeout(total / 3);
        await page.waitForTimeout(total / 3);
        await u.po.userProfile.goTo();
        await page.waitForTimeout(total / 3);
        await u.page.goToRelative(`/action-with-use-reverification`);
        await u.po.expect.toBeSignedIn();
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await u.po.userVerification.waitForMounted();
      });
    });
  },
);
