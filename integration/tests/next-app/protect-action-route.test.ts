import type { OrganizationMembershipRole } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../../presets';
import type { FakeOrganization, FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

const utils = ['action', 'route'];
const capitalize = (type: string) => type[0].toUpperCase() + type.slice(1);
testAgainstRunningApps({ withEnv: [appConfigs.envs.withReverification] })(
  '@nextjs authorization with protectAction and protectRoute',
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
      test(`protect${capitalize(type)} returned values as ${'`admin`'}`, async ({ page, context }) => {
        // test.setTimeout(1200000);
        const u = createTestUtils({ app, page, context });

        await u.po.signIn.goTo();
        await u.po.signIn.waitForMounted();
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
        await u.po.expect.toBeSignedIn();

        await u.po.organizationSwitcher.goTo();
        await u.po.organizationSwitcher.waitForMounted();
        await u.po.organizationSwitcher.waitForAnOrganizationToSelected();

        const startTime = performance.mark('startTime');

        await u.page.goToRelative(`/protect-${type}/signed-out`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(u.page.getByText(/\{\s*"userId"\s*:\s*"user_[^"]+"\s*\}/i)).toBeVisible();

        await u.page.goToRelative(`/protect-${type}/signed-out-with-role`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(u.page.getByText(/\{\s*"userId"\s*:\s*"user_[^"]+"\s*\}/i)).toBeVisible();

        await u.page.goToRelative(`/protect-${type}/signed-out-with-reverification`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(u.page.getByText(/\{\s*"userId"\s*:\s*"user_[^"]+"\s*\}/i)).toBeVisible();

        await u.page.goToRelative(`/protect-${type}/signed-out-with-all`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(u.page.getByText(/\{\s*"userId"\s*:\s*"user_[^"]+"\s*\}/i)).toBeVisible();

        performance.mark('endTime');
        const delay = performance.measure('dwa', startTime, 'endTime');

        const seconds = Math.floor(delay.duration / 1000);
        const total = 1000 * 90 - seconds;
        await page.waitForTimeout(total / 3);
        await page.waitForTimeout(total / 3);
        await u.po.userProfile.goTo();
        await page.waitForTimeout(total / 3);
        await u.page.goToRelative(`/protect-${type}/signed-out-with-reverification`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(
          u.page.getByText(
            /\{\s*"clerk_error"\s*:\s*\{\s*"type"\s*:\s*"forbidden"\s*,\s*"reason"\s*:\s*"assurance"\s*,\s*"metadata"\s*:\s*\{\s*"level"\s*:\s*"secondFactor"\s*,\s*"afterMinutes"\s*:\s*1\s*\}\s*\}\s*\}/i,
          ),
        ).toBeVisible();

        await u.page.goToRelative(`/protect-${type}/signed-out-with-all`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(
          u.page.getByText(
            /\{\s*"clerk_error"\s*:\s*\{\s*"type"\s*:\s*"forbidden"\s*,\s*"reason"\s*:\s*"assurance"\s*,\s*"metadata"\s*:\s*\{\s*"level"\s*:\s*"secondFactor"\s*,\s*"afterMinutes"\s*:\s*1\s*\}\s*\}\s*\}/i,
          ),
        ).toBeVisible();
      });
    });

    utils.forEach(type => {
      test(`protect${capitalize(type)} returned values as ${'`signed-out user`'}`, async ({ page, context }) => {
        const u = createTestUtils({ app, page, context });

        const routes = [
          `/protect-${type}/signed-out`,
          `/protect-${type}/signed-out-with-role`,
          `/protect-${type}/signed-out-with-reverification`,
          `/protect-${type}/signed-out-with-all`,
        ];

        for (const route of routes) {
          await u.page.goToRelative(route);
          await u.page.getByRole('button', { name: /LogUserId/i }).click();
          await expect(
            u.page.getByText(
              /\{\s*"clerk_error"\s*:\s*\{\s*"type"\s*:\s*"unauthorized"\s*,\s*"reason"\s*:\s*"signed-out"\s*\}\s*\}/i,
            ),
          ).toBeVisible();
        }
      });
    });

    utils.forEach(type => {
      test(`protect${capitalize(type)} returned values as ${'`signed-in user`'}`, async ({ page, context }) => {
        // test.setTimeout(1200000);
        const u = createTestUtils({ app, page, context });

        await u.po.signIn.goTo();
        await u.po.signIn.waitForMounted();
        await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeViewer.email, password: fakeViewer.password });
        await u.po.expect.toBeSignedIn();
        const startTime = performance.mark('startTime');

        await u.page.goToRelative(`/protect-${type}/signed-out`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(u.page.getByText(/\{\s*"userId"\s*:\s*"user_[^"]+"\s*\}/i)).toBeVisible();

        await u.page.goToRelative(`/protect-${type}/signed-out-with-role`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(
          u.page.getByText(
            /\{\s*"clerk_error"\s*:\s*\{\s*"type"\s*:\s*"something"\s*,\s*"reason"\s*:\s*"something"\s*,\s*"metadata"\s*:\s*\{\s*"role"\s*:\s*"org:admin"\s*\}\s*\}\s*\}/i,
          ),
        ).toBeVisible();

        await u.page.goToRelative(`/protect-${type}/signed-out-with-reverification`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(u.page.getByText(/\{\s*"userId"\s*:\s*"user_[^"]+"\s*\}/i)).toBeVisible();

        await u.page.goToRelative(`/protect-${type}/signed-out-with-all`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(
          u.page.getByText(
            /\{\s*"clerk_error"\s*:\s*\{\s*"type"\s*:\s*"something"\s*,\s*"reason"\s*:\s*"something"\s*,\s*"metadata"\s*:\s*\{\s*"role"\s*:\s*"org:admin"\s*\}\s*\}\s*\}/i,
          ),
        ).toBeVisible();

        performance.mark('endTime');
        const delay = performance.measure('dwa', startTime, 'endTime');

        const seconds = Math.floor(delay.duration / 1000);
        const total = 1000 * 90 - seconds;
        await page.waitForTimeout(total / 3);
        await page.waitForTimeout(total / 3);
        await u.po.userProfile.goTo();
        await page.waitForTimeout(total / 3);
        await u.page.goToRelative(`/protect-${type}/signed-out-with-reverification`);
        await u.page.getByRole('button', { name: /LogUserId/i }).click();
        await expect(
          u.page.getByText(
            /\{\s*"clerk_error"\s*:\s*\{\s*"type"\s*:\s*"forbidden"\s*,\s*"reason"\s*:\s*"assurance"\s*,\s*"metadata"\s*:\s*\{\s*"level"\s*:\s*"secondFactor"\s*,\s*"afterMinutes"\s*:\s*1\s*\}\s*\}\s*\}/i,
          ),
        ).toBeVisible();
      });
    });
  },
);
