import type { OrganizationMembershipRole } from '@clerk/backend';
import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';
import type { FakeOrganization, FakeUser } from '../testUtils';
import { createTestUtils } from '../testUtils';

test.describe('authorization @nextjs', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;
  let fakeAdmin: FakeUser;
  let fakeViewer: FakeUser;
  let fakeOrganization: FakeOrganization;

  test.beforeAll(async () => {
    app = await appConfigs.next.appRouter
      .clone()
      .addFile(
        'src/app/settings/rsc-protect/page.tsx',
        () => `
      import { Protect } from '@clerk/nextjs';
      export default function Page() {
        return (
          <Protect role="admin" fallback={<p>User is not admin</p>}>
              <p>User has access</p>
          </Protect>
        );
      }`,
      )
      .addFile(
        'src/app/settings/rcc-protect/page.tsx',
        () => `
      "use client";
      import { Protect } from '@clerk/nextjs';
      export default function Page() {
        return (
          <Protect permission="org:posts:manage" fallback={<p>User is missing permissions</p>}>
              <p>User has access</p>
          </Protect>
        );
      }`,
      )
      .addFile(
        'src/app/settings/useAuth-has/page.tsx',
        () => `
      "use client";
      import { useAuth } from '@clerk/nextjs';
      export default function Page() {
        const {has, isLoaded} = useAuth()
        if(!isLoaded) return <p>Loading</p>
        if(!has({role: 'admin'})) {
            return <p>User is not admin</p>
        }
        return <p>User has access</p>
      }`,
      )
      .addFile(
        'src/app/settings/auth-has/page.tsx',
        () => `
      import { auth } from '@clerk/nextjs/server';
      export default function Page() {
        const {userId, has} = auth()
        if(!userId || !has({permission: 'org:posts:manage'})) {
            return <p>User is missing permissions</p>
        }
        return <p>User has access</p>
      }`,
      )
      .addFile(
        'src/app/settings/auth-protect/page.tsx',
        () => `
      import { auth } from '@clerk/nextjs/server';
      export default function Page() {
        const { user } = auth().protect({role: 'admin'})
        return <p>User has access</p>
      }`,
      )
      .addFile(
        'src/app/api/settings/route.ts',
        () => `
      import { auth } from '@clerk/nextjs/server';
      export function GET() {
        const { userId } = auth().protect(has => has({ role: 'admin' }) || has({role: 'org:editor'}));
        return new Response(JSON.stringify({userId}));
      }`,
      )
      .addFile(
        'src/app/switcher/page.tsx',
        () => `
      import { OrganizationSwitcher } from '@clerk/nextjs';

      export default function Page() {
        return (
          <OrganizationSwitcher hidePersonal={true}/>
        );
      }`,
      )
      .commit();
    await app.setup();
    await app.withEnv(appConfigs.envs.withCustomRoles);
    await app.dev();

    const m = createTestUtils({ app });
    fakeAdmin = m.services.users.createFakeUser();
    const { data: admin } = await m.services.users.createBapiUser(fakeAdmin);
    fakeOrganization = await m.services.users.createFakeOrganization(admin.id);
    fakeViewer = m.services.users.createFakeUser();
    const { data: viewer } = await m.services.users.createBapiUser(fakeViewer);

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

  test('Protect in RSCs and RCCs as `admin`', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeAdmin.email, password: fakeAdmin.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/switcher');
    await u.page.waitForSelector('.cl-organizationSwitcher-root', { state: 'attached' });
    await expect(u.page.getByText(/No organization selected/i)).toBeVisible();
    await u.page.locator('.cl-organizationSwitcherTrigger').click();
    await u.page.locator('.cl-organizationSwitcherPreviewButton').click();
    await u.page.waitForSelector('.cl-userPreviewMainIdentifier__personalWorkspace', { state: 'detached' });

    await u.page.goToRelative('/settings/rsc-protect');
    await expect(u.page.getByText(/User has access/i)).toBeVisible();
    await u.page.goToRelative('/settings/rcc-protect');
    await expect(u.page.getByText(/User has access/i)).toBeVisible();
    await u.page.goToRelative('/settings/useAuth-has');
    await expect(u.page.getByText(/User has access/i)).toBeVisible();
    await u.page.goToRelative('/settings/auth-has');
    await expect(u.page.getByText(/User has access/i)).toBeVisible();
    await u.page.goToRelative('/settings/auth-protect');
    await expect(u.page.getByText(/User has access/i)).toBeVisible();

    // route handler
    await u.page.goToRelative('/api/settings/');
    await expect(u.page.getByText(/userId/i)).toBeVisible();
  });

  test('Protect in RSCs and RCCs as `signed-out user`', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.page.goToRelative('/settings/rsc-protect');
    await expect(u.page.getByText(/User is not admin/i)).toBeVisible();
    await u.page.goToRelative('/settings/rcc-protect');
    await expect(u.page.getByText(/User is missing permissions/i)).toBeVisible();
    await u.page.goToRelative('/settings/useAuth-has');
    await expect(u.page.getByText(/User is not admin/i)).toBeVisible();
    await u.page.goToRelative('/settings/auth-has');
    await expect(u.page.getByText(/User is missing permissions/i)).toBeVisible();
    await u.page.goToRelative('/settings/auth-protect');
    await expect(u.page.getByText(/this page could not be found/i)).toBeVisible();
  });

  test('Protect in RSCs and RCCs as `viewer`', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context });

    await u.po.signIn.goTo();
    await u.po.signIn.waitForMounted();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeViewer.email, password: fakeViewer.password });
    await u.po.expect.toBeSignedIn();

    await u.page.goToRelative('/switcher');
    await u.page.waitForSelector('.cl-organizationSwitcher-root', { state: 'attached' });
    await expect(u.page.getByText(/No organization selected/i)).toBeVisible();
    await u.page.locator('.cl-organizationSwitcherTrigger').click();
    await u.page.locator('.cl-organizationSwitcherPreviewButton').click();
    await u.page.waitForSelector('.cl-userPreviewMainIdentifier__personalWorkspace', { state: 'detached' });

    await u.page.goToRelative('/settings/rsc-protect');
    await expect(u.page.getByText(/User is not admin/i)).toBeVisible();
    await u.page.goToRelative('/settings/rcc-protect');
    await expect(u.page.getByText(/User is missing permissions/i)).toBeVisible();
    await u.page.goToRelative('/settings/useAuth-has');
    await expect(u.page.getByText(/User is not admin/i)).toBeVisible();
    await u.page.goToRelative('/settings/auth-has');
    await expect(u.page.getByText(/User is missing permissions/i)).toBeVisible();
    await u.page.goToRelative('/settings/auth-protect');
    await expect(u.page.getByText(/this page could not be found/i)).toBeVisible();

    // route handler
    await u.page.goToRelative('/api/settings/');

    // Result of 404 response with empty body
    expect(await u.page.content()).toEqual('<html><head></head><body></body></html>');
  });
});
