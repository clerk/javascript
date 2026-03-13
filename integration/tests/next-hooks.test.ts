import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeOrganization, FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('Next.js Client Hooks @nextjs', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;
  let fakeOrganization: FakeOrganization;

  test.beforeAll(async () => {
    const u = createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser();
    const user = await u.services.users.createBapiUser(fakeUser);
    fakeOrganization = await u.services.users.createFakeOrganization(user.id);
  });

  test.afterAll(async () => {
    await fakeOrganization.delete();
    await fakeUser.deleteIfExists();
    await app.teardown();
  });

  const signIn = async ({ app, page, context }) => {
    const u = createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();
    return u;
  };

  const signInAndActivateOrg = async ({ app, page, context, hookPath }) => {
    const u = await signIn({ app, page, context });
    await u.page.goToRelative(hookPath);
    await u.page.waitForClerkJsLoaded();
    await u.page.evaluate(async (id: string) => {
      await window.Clerk.setActive({ organization: id });
    }, fakeOrganization.organization.id);
    return u;
  };

  test.describe('signed out state', () => {
    test('useAuth returns unauthenticated state', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/hooks/use-auth');
      await expect(u.page.getByTestId('is-loaded')).toHaveText('true');
      await expect(u.page.getByTestId('is-signed-in')).toHaveText('false');
      await expect(u.page.getByTestId('user-id')).toHaveText('null');
      await expect(u.page.getByTestId('session-id')).toHaveText('null');
      await expect(u.page.getByTestId('org-id')).toHaveText('null');
      await expect(u.page.getByTestId('org-role')).toHaveText('null');
      await expect(u.page.getByTestId('org-slug')).toHaveText('null');
    });

    test('useUser returns unauthenticated state', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/hooks/use-user');
      await expect(u.page.getByTestId('is-loaded')).toHaveText('true');
      await expect(u.page.getByTestId('is-signed-in')).toHaveText('false');
      await expect(u.page.getByTestId('user-id')).toHaveText('undefined');
      await expect(u.page.getByTestId('user-email')).toHaveText('undefined');
    });

    test('useSession returns unauthenticated state', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/hooks/use-session');
      await expect(u.page.getByTestId('is-loaded')).toHaveText('true');
      await expect(u.page.getByTestId('is-signed-in')).toHaveText('false');
      await expect(u.page.getByTestId('session-id')).toHaveText('undefined');
      await expect(u.page.getByTestId('session-status')).toHaveText('undefined');
    });

    test('useOrganization returns empty when signed out', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/hooks/use-organization');
      await expect(u.page.getByTestId('is-loaded')).toHaveText('false');
      await expect(u.page.getByTestId('org-id')).toHaveText('undefined');
    });

    test('useClerk is available when signed out', async ({ page, context }) => {
      const u = createTestUtils({ app, page, context });
      await u.page.goToRelative('/hooks/use-clerk');
      await expect(u.page.getByTestId('loaded')).toHaveText('true');
      await expect(u.page.getByTestId('user-id')).toHaveText('undefined');
      await expect(u.page.getByTestId('session-id')).toHaveText('undefined');
    });
  });

  test.describe('signed in state', () => {
    test('useAuth returns authenticated state', async ({ page, context }) => {
      const u = await signIn({ app, page, context });
      await u.page.goToRelative('/hooks/use-auth');
      await expect(u.page.getByTestId('is-loaded')).toHaveText('true');
      await expect(u.page.getByTestId('is-signed-in')).toHaveText('true');
      const userId = await u.page.getByTestId('user-id').textContent();
      expect(userId).toMatch(/^user_/);
      const sessionId = await u.page.getByTestId('session-id').textContent();
      expect(sessionId).toMatch(/^sess_/);
    });

    test('useUser returns user object', async ({ page, context }) => {
      const u = await signIn({ app, page, context });
      await u.page.goToRelative('/hooks/use-user');
      await expect(u.page.getByTestId('is-loaded')).toHaveText('true');
      await expect(u.page.getByTestId('is-signed-in')).toHaveText('true');
      const userId = await u.page.getByTestId('user-id').textContent();
      expect(userId).toMatch(/^user_/);
      const email = await u.page.getByTestId('user-email').textContent();
      expect(email).toContain('@');
    });

    test('useSession returns active session', async ({ page, context }) => {
      const u = await signIn({ app, page, context });
      await u.page.goToRelative('/hooks/use-session');
      await expect(u.page.getByTestId('is-loaded')).toHaveText('true');
      await expect(u.page.getByTestId('is-signed-in')).toHaveText('true');
      const sessionId = await u.page.getByTestId('session-id').textContent();
      expect(sessionId).toMatch(/^sess_/);
      await expect(u.page.getByTestId('session-status')).toHaveText('active');
    });

    test('useOrganization returns loaded state', async ({ page, context }) => {
      const u = await signIn({ app, page, context });
      await u.page.goToRelative('/hooks/use-organization');
      await expect(u.page.getByTestId('is-loaded')).toHaveText('true');
    });

    test('useOrganizationList returns user memberships', async ({ page, context }) => {
      const u = await signIn({ app, page, context });
      await u.page.goToRelative('/hooks/use-organization-list');
      await expect(u.page.getByTestId('is-loaded')).toHaveText('true');
      await expect(u.page.getByTestId('memberships-org-ids')).toContainText(fakeOrganization.organization.id);
    });

    test('useSessionList returns active sessions', async ({ page, context }) => {
      const u = await signIn({ app, page, context });
      await u.page.goToRelative('/hooks/use-session-list');
      await expect(u.page.getByTestId('is-loaded')).toHaveText('true');
      const count = await u.page.getByTestId('sessions-count').textContent();
      expect(Number(count)).toBeGreaterThanOrEqual(1);
      const firstSessionId = await u.page.getByTestId('first-session-id').textContent();
      expect(firstSessionId).toMatch(/^sess_/);
    });

    test('useClerk returns clerk with user and session', async ({ page, context }) => {
      const u = await signIn({ app, page, context });
      await u.page.goToRelative('/hooks/use-clerk');
      await expect(u.page.getByTestId('loaded')).toHaveText('true');
      const userId = await u.page.getByTestId('user-id').textContent();
      expect(userId).toMatch(/^user_/);
      const sessionId = await u.page.getByTestId('session-id').textContent();
      expect(sessionId).toMatch(/^sess_/);
    });
  });

  test.describe('with active organization', () => {
    test('useAuth includes org fields after org switch', async ({ page, context }) => {
      const u = await signInAndActivateOrg({ app, page, context, hookPath: '/hooks/use-auth' });
      const orgId = fakeOrganization.organization.id;

      await expect(u.page.getByTestId('org-id')).toHaveText(orgId);

      const orgRole = u.page.getByTestId('org-role');
      await expect(orgRole).toHaveText('org:admin');

      await expect(u.page.getByTestId('has-org-admin')).toHaveText('true');
    });

    test('useOrganization returns active org data', async ({ page, context }) => {
      const u = await signInAndActivateOrg({ app, page, context, hookPath: '/hooks/use-organization' });
      const orgId = fakeOrganization.organization.id;

      await expect(u.page.getByTestId('is-loaded')).toHaveText('true');
      await expect(u.page.getByTestId('org-id')).toHaveText(orgId);

      const orgName = u.page.getByTestId('org-name');
      await expect(orgName).not.toHaveText('undefined');

      const orgNameText = await orgName.textContent();
      expect(orgNameText.length).toBeGreaterThan(0);
      await expect(u.page.getByTestId('membership-role')).toHaveText('org:admin');
    });
  });
});
