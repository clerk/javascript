import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeOrganization, FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withCustomRoles] })('common cache @nextjs', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeAdmin: FakeUser;
  let fakeOrganization: FakeOrganization;

  test.beforeAll(async () => {
    const m = createTestUtils({ app });
    fakeAdmin = m.services.users.createFakeUser();
    const admin = await m.services.users.createBapiUser(fakeAdmin);
    fakeOrganization = await m.services.users.createFakeOrganization(admin.id);
  });

  test.afterAll(async () => {
    await fakeOrganization.delete();
    await fakeAdmin.deleteIfExists();
    await app.teardown();
  });

  test('Monitor updates from hooks when actions are triggered from the components', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    const orgName = faker.animal.dog().toLowerCase().replaceAll(' ', '-');

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/custom-switcher');

    await u.po.createOrganization.waitForMounted();
    await u.po.createOrganization.setOrganizationName(orgName);
    await u.po.createOrganization.createOrganization();

    await page.waitForSelector(`[data-name=${orgName}]`, { state: 'attached' });
    await expect(u.page.getByText(orgName)).toBeVisible();

    // Clean up the created org
    await page.locator(`button[data-name=${orgName}]`).click();
  });
});
