import { createHash } from 'node:crypto';

import type { OAuthApplication, Organization } from '@clerk/backend';
import type { BrowserContext, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { FakeUser } from '../../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../../testUtils';

testAgainstRunningApps({ withPattern: ['next.appRouterMosaic.*'] })('Mosaic OAuthConsent @mosaic', ({ app }) => {
  test.describe.configure({ mode: 'serial' });

  let fakeUser: FakeUser;
  let organization: Organization;
  let otherOrganization: Organization;
  let oauthApp: OAuthApplication;
  const cleanups: Array<() => Promise<unknown>> = [];

  const path = '/oauth-consent';
  const state = 'mosaic-consent-state';
  const codeChallenge = createHash('sha256')
    .update('mosaic-consent-code-verifier-0123456789abcdef')
    .digest('base64url');
  const redirectUri = () => new URL('/oauth-consent/callback', app.serverUrl).toString();

  test.beforeAll(async () => {
    const u = await createTestUtils({ app });
    fakeUser = u.services.users.createFakeUser(test);
    cleanups.push(() => fakeUser.deleteIfExists());
    const user = await u.services.users.createBapiUser(fakeUser);
    organization = await u.services.clerk.organizations.createOrganization({
      name: `Mosaic OAuthConsent ${Date.now()}`,
      createdBy: user.id,
    });
    cleanups.push(() => u.services.clerk.organizations.deleteOrganization(organization.id));
    otherOrganization = await u.services.clerk.organizations.createOrganization({
      name: `Mosaic OAuthConsent Other ${Date.now()}`,
      createdBy: user.id,
    });
    cleanups.push(() => u.services.clerk.organizations.deleteOrganization(otherOrganization.id));
    oauthApp = await u.services.clerk.oauthApplications.create({
      name: `Mosaic OAuthConsent ${Date.now()}`,
      redirectUris: [redirectUri()],
      scopes: 'profile email user:org:read',
    });
    cleanups.push(() => u.services.clerk.oauthApplications.delete(oauthApp.id));
  });

  test.afterAll(async () => {
    const results = await Promise.allSettled(cleanups.map(cleanup => cleanup()));
    await app.teardown();
    const failures = results.flatMap(result => (result.status === 'rejected' ? [result.reason] : []));
    if (failures.length > 0) {
      throw new AggregateError(failures, 'Mosaic OAuthConsent cleanup failed');
    }
  });

  function authorizeParams(scope = 'profile email') {
    return new URLSearchParams({
      client_id: oauthApp.clientId,
      redirect_uri: redirectUri(),
      scope,
      response_type: 'code',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
  }

  const heading = (page: Page) =>
    page.getByRole('heading', { name: new RegExp(`^${oauthApp.name} would like to access your .+ account$`) });

  async function signIn({ page, context }: { page: Page; context: BrowserContext }) {
    const u = await createTestUtils({ app, page, context });
    await u.po.signIn.goTo();
    await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
    await u.po.expect.toBeSignedIn();
    return u;
  }

  async function waitForCallback(page: Page) {
    await page.waitForURL(url => url.pathname === '/oauth-consent/callback');
    return new URL(page.url()).searchParams;
  }

  test('renders nothing when signed out', async ({ page, context }) => {
    const u = await createTestUtils({ app, page, context });
    await u.page.goToRelative(path, { searchParams: authorizeParams() });
    await u.page.waitForClerkJsLoaded();
    await expect(page.getByText('consent-loading')).toHaveCount(0);

    await expect(page.locator('.cl-card-root')).toHaveCount(0);
  });

  test('shows an error without a client ID', async ({ page, context }) => {
    const u = await signIn({ page, context });
    const params = authorizeParams();
    params.delete('client_id');
    await u.page.goToRelative(path, { searchParams: params });

    await expect(page.getByText('The client ID is missing.')).toBeVisible();
  });

  test('shows the OAuth application and the requested scopes', async ({ page, context }) => {
    const u = await signIn({ page, context });
    await u.page.goToRelative(path, { searchParams: authorizeParams() });

    await expect(heading(page)).toBeVisible();
    await expect(page.getByRole('list', { name: /^This will allow .+ access to:$/ }).getByRole('listitem')).toHaveCount(
      2,
    );
  });

  test('redirects with a code and the state when the user allows access', async ({ page, context }) => {
    const u = await signIn({ page, context });
    await u.page.goToRelative(path, { searchParams: authorizeParams() });
    await expect(heading(page)).toBeVisible();

    await page.getByRole('button', { name: 'Allow' }).click();

    const params = await waitForCallback(page);
    expect(params.get('code')).toBeTruthy();
    expect(params.get('state')).toBe(state);
  });

  test('redirects with access_denied and the state when the user denies access', async ({ page, context }) => {
    const u = await signIn({ page, context });
    await u.page.goToRelative(path, { searchParams: authorizeParams() });
    await expect(heading(page)).toBeVisible();

    await page.getByRole('button', { name: 'Deny' }).click();

    const params = await waitForCallback(page);
    expect(params.get('error')).toBe('access_denied');
    expect(params.get('state')).toBe(state);
  });

  test('grants access for every organization the user picks', async ({ page, context }) => {
    const u = await signIn({ page, context });
    await page.evaluate(orgId => window.Clerk?.setActive({ organization: orgId }), organization.id);
    await page.waitForFunction(orgId => window.Clerk?.session?.lastActiveOrganizationId === orgId, organization.id);
    await u.page.goToRelative(path, { searchParams: authorizeParams('profile email user:org:read') });
    await expect(heading(page)).toBeVisible();
    const picker = page.getByRole('combobox', { name: /^Grant access for:/ });
    await expect(picker).toHaveText(organization.name);

    await picker.click();
    await page.getByRole('option', { name: otherOrganization.name }).click();
    await page.keyboard.press('Escape');
    await expect(picker).toHaveText('2 organizations');

    const consentRequest = page.waitForRequest(
      request => request.method() === 'POST' && request.url().includes(`/me/oauth/consent/`),
    );
    await page.getByRole('button', { name: 'Allow' }).click();

    const posted = new URLSearchParams((await consentRequest).postData() ?? '');
    expect(posted.getAll('organization_id')).toEqual([organization.id, otherOrganization.id]);
    const params = await waitForCallback(page);
    expect(params.get('code')).toBeTruthy();
    expect(params.get('state')).toBe(state);
  });

  test('grants only the scopes the user keeps checked', async ({ page, context }) => {
    const u = await signIn({ page, context });
    await u.page.goToRelative(path, { searchParams: authorizeParams('profile email') });
    await expect(heading(page)).toBeVisible();

    await page.getByRole('checkbox', { name: 'Your email address' }).uncheck();

    const consentRequest = page.waitForRequest(
      request => request.method() === 'POST' && request.url().includes(`/me/oauth/consent/`),
    );
    await page.getByRole('button', { name: 'Allow' }).click();

    const posted = new URLSearchParams((await consentRequest).postData() ?? '');
    expect(posted.getAll('scope')).toEqual(['profile']);
    const params = await waitForCallback(page);
    expect(params.get('code')).toBeTruthy();
    expect(params.get('state')).toBe(state);
  });

  test('grants no organization when the user unchecks organization access', async ({ page, context }) => {
    const u = await signIn({ page, context });
    await u.page.goToRelative(path, { searchParams: authorizeParams('profile email user:org:read') });
    await expect(heading(page)).toBeVisible();
    const picker = page.getByRole('combobox', { name: /^Grant access for:/ });
    await expect(picker).toBeVisible();

    await page.getByRole('checkbox', { name: 'Your organization membership information' }).uncheck();
    await expect(picker).toHaveCount(0);

    const consentRequest = page.waitForRequest(
      request => request.method() === 'POST' && request.url().includes(`/me/oauth/consent/`),
    );
    await page.getByRole('button', { name: 'Allow' }).click();

    const posted = new URLSearchParams((await consentRequest).postData() ?? '');
    expect(posted.getAll('scope')).toEqual(['profile email']);
    expect(posted.has('organization_id')).toBe(false);
    const params = await waitForCallback(page);
    expect(params.get('code')).toBeTruthy();
    expect(params.get('state')).toBe(state);
  });
});
