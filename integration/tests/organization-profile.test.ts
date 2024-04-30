import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeOrganization, FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('organization profile @generic', () => {
  test.describe.configure({ mode: 'serial' });
  let app: Application;
  let fakeUser: FakeUser;
  let fakeOrganization: FakeOrganization;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        'src/app/organization/page.tsx',
        () => `
import { OrganizationProfile } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <OrganizationProfile routing="hash" hidePersonal={true} />
    </div>
  );
}`,
      )
      .commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withEmailCodes);
    await app.dev();
  });

  test.beforeEach(async () => {
    const m = createTestUtils({ app });
    fakeUser = m.services.users.createFakeUser();
    const user = await m.services.users.createBapiUser(fakeUser);
    fakeOrganization = m.services.users.createFakeOrganization();
    await m.services.users.createBapiOrganization(fakeOrganization, user.id);
  });

  test.afterEach(async () => {
    await fakeUser.deleteIfExists();
  });

  test.afterAll(async () => {
    await app.teardown();
  });

  test("select an organization and update it's name", async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.po.organizationSwitcher.goTo();
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.expectNoOrganizationSelected();
    await u.po.organizationSwitcher.toggleTrigger();
    await u.po.organizationSwitcher.selectOrganizationByName(fakeOrganization.name);

    await u.po.organizationProfile.goTo();
    await u.po.organizationProfile.waitForMounted();

    await u.po.organizationProfile.clickUpdateProfile();
    await u.po.organizationProfile.waitForSectionCardOpened('organizationProfile');

    const newOrganizationName = `Updated ${fakeOrganization.name}`;
    await u.po.organizationProfile.typeOrganizationName(newOrganizationName);

    await u.po.organizationProfile.clickSave();

    await expect(
      u.page.locator('.cl-profileSectionItem__organizationProfile .cl-organizationPreviewMainIdentifier'),
    ).toHaveText(newOrganizationName);
  });

  test('delete organization', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();

    await u.po.organizationSwitcher.goTo();
    await u.po.organizationSwitcher.waitForMounted();
    await u.po.organizationSwitcher.expectNoOrganizationSelected();
    await u.po.organizationSwitcher.toggleTrigger();
    await u.po.organizationSwitcher.selectOrganizationByName(fakeOrganization.name);

    await u.po.organizationProfile.goTo();
    await u.po.organizationProfile.waitForMounted();

    await u.po.organizationProfile.clickDeleteOrganization();
    await u.po.organizationProfile.waitForSectionCardOpened('organizationDanger');

    await u.po.organizationProfile.typeConfirmationMessage(fakeOrganization.name);

    await u.po.organizationProfile.clickDeleteOrganization();

    await u.po.organizationProfile.waitToBeUnMounted();

    await u.page.waitForAppUrl('/');
  });
});
