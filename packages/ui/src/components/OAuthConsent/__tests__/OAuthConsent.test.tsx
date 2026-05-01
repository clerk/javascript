import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { OAuthConsent } from '../OAuthConsent';

const { createFixtures } = bindCreateFixtures('OAuthConsent');

const fakeConsentInfo = {
  oauthApplicationName: 'Clerk CLI',
  oauthApplicationLogoUrl: 'https://example.com/logo.png',
  oauthApplicationUrl: 'https://example.com',
  clientId: 'client_test',
  state: 'abc',
  scopes: [
    { scope: 'openid', description: 'View your identity', requiresConsent: true },
    { scope: 'email', description: 'Access your email address', requiresConsent: true },
  ],
};

const fakeConsentInfoWithOrgScope = {
  ...fakeConsentInfo,
  scopes: [
    ...fakeConsentInfo.scopes,
    { scope: 'user:org:read', description: 'Access your organizations', requiresConsent: true },
  ],
};

/**
 * `oauthApplication` is a getter on the Clerk prototype and cannot be assigned
 * directly. Use Object.defineProperty to replace it with a configurable mock.
 */
function mockOAuthApplication(
  clerkInstance: any,
  impl: { getConsentInfo: ReturnType<typeof vi.fn>; buildConsentActionUrl?: ReturnType<typeof vi.fn> },
) {
  const merged = {
    buildConsentActionUrl: vi.fn().mockReturnValue('https://clerk.example/__clerk_api/v1/me/oauth/consent/client_test'),
    ...impl,
  };
  Object.defineProperty(clerkInstance, 'oauthApplication', {
    configurable: true,
    get: () => merged,
  });
}

describe('OAuthConsent', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: {
        ...originalLocation,
        search: '?client_id=client_test&redirect_uri=https%3A%2F%2Fapp.example%2Fcallback',
        href: 'https://app.example/?client_id=client_test&redirect_uri=https%3A%2F%2Fapp.example%2Fcallback',
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
    // Do not call vi.restoreAllMocks() here — it would restore the matchMedia mock
    // set in the global vitest setup file, which would cause subsequent tests to fail
    // with "Cannot read properties of undefined (reading 'matches')".
    vi.clearAllMocks();
  });

  it('renders consent card when hook data loads (public path)', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['jane@example.com'] });
    });

    // Provide a minimal context so ComponentContextProvider doesn't crash on
    // undefined props. The public path derives data from the hook, not context.
    props.setProps({ componentName: 'OAuthConsent' } as any);

    const getConsentInfo = vi.fn().mockResolvedValue(fakeConsentInfo);
    mockOAuthApplication(fixtures.clerk, { getConsentInfo });

    const { getByText } = render(<OAuthConsent />, { wrapper });

    await waitFor(() => {
      expect(getByText('Clerk CLI')).toBeVisible();
      expect(getByText('View your identity')).toBeVisible();
      expect(getByText('Access your email address')).toBeVisible();
    });

    expect(getConsentInfo).toHaveBeenCalledWith({
      oauthClientId: 'client_test',
    });
  });

  it('renders a single form with allow/deny submit buttons in the public flow', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['jane@example.com'] });
    });

    props.setProps({ componentName: 'OAuthConsent' } as any);
    mockOAuthApplication(fixtures.clerk, { getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfo) });

    const { baseElement } = render(<OAuthConsent />, { wrapper });

    await waitFor(() => {
      const form = baseElement.querySelector('form[action*="/v1/me/oauth/consent/"]');
      expect(form).not.toBeNull();

      const allowButton = form!.querySelector('button[value="true"]');
      const denyButton = form!.querySelector('button[value="false"]');
      expect(allowButton).not.toBeNull();
      expect(denyButton).not.toBeNull();
    });
  });

  it('fires form submission on Allow click', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['jane@example.com'] });
    });

    props.setProps({ componentName: 'OAuthConsent' } as any);
    mockOAuthApplication(fixtures.clerk, { getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfo) });

    const { getByText, baseElement } = render(<OAuthConsent />, { wrapper });

    const allowButton = await waitFor(() => getByText('Allow'));
    const form = baseElement.querySelector('form[action*="/v1/me/oauth/consent/"]')!;

    let submitted = false;
    form.addEventListener('submit', e => {
      e.preventDefault();
      submitted = true;
    });

    allowButton.click();

    expect(submitted).toBe(true);
  });

  it('fires form submission on Deny click', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['jane@example.com'] });
    });

    props.setProps({ componentName: 'OAuthConsent' } as any);
    mockOAuthApplication(fixtures.clerk, { getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfo) });

    const { getByText, baseElement } = render(<OAuthConsent />, { wrapper });

    const denyButton = await waitFor(() => getByText('Deny'));
    const form = baseElement.querySelector('form[action*="/v1/me/oauth/consent/"]')!;

    let submitted = false;
    form.addEventListener('submit', e => {
      e.preventDefault();
      submitted = true;
    });

    denyButton.click();

    expect(submitted).toBe(true);
  });

  it('renders nothing when unauthenticated', async () => {
    const { wrapper, fixtures, props } = await createFixtures();

    props.setProps({ componentName: 'OAuthConsent' } as any);

    const getConsentInfo = vi.fn().mockResolvedValue(fakeConsentInfo);
    mockOAuthApplication(fixtures.clerk, { getConsentInfo });

    const { queryByText } = render(<OAuthConsent />, { wrapper });

    expect(queryByText('Clerk CLI')).toBeNull();
    expect(getConsentInfo).not.toHaveBeenCalled();
  });

  it('passes explicit oauthClientId and scope props through to the hook (public path override)', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['jane@example.com'] });
    });

    // Simulate the React wrapper forwarding public props through to the
    // context provider. This verifies that ClerkUIComponentsContext copies
    // `oauthClientId` and `scope` into the context (not just the legacy
    // `oAuth*` fields).
    props.setProps({
      componentName: 'OAuthConsent',
      oauthClientId: 'override_id',
      scope: 'openid email',
    } as any);

    const getConsentInfo = vi.fn().mockResolvedValue(fakeConsentInfo);
    mockOAuthApplication(fixtures.clerk, { getConsentInfo });

    render(<OAuthConsent />, { wrapper });

    await waitFor(() => {
      expect(getConsentInfo).toHaveBeenCalledWith({
        oauthClientId: 'override_id',
        scope: 'openid email',
      });
    });
  });

  it('uses context values when provided (accounts portal path)', async () => {
    const onAllowSpy = vi.fn();
    const onDenySpy = vi.fn();

    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['jane@example.com'] });
    });

    // Simulate the accounts portal path: `clerk.mountOAuthConsent` is
    // called with the legacy `oAuth*` (capital-A) prop shape from
    // `OAuthConsentProps`. The `ComponentContextProvider` translates
    // these to the lowercase `oauth*` shape that the component reads from context
    // (see the `case 'OAuthConsent':` block in ClerkUIComponentsContext.tsx).
    // This test verifies the translation end-to-end: if it were broken, the
    // component would fall back to the hook mock's 'Clerk CLI' name and the
    // `getByText('Accounts Portal App')` assertion would fail.
    props.setProps({
      componentName: 'OAuthConsent',
      scopes: [{ scope: 'openid', description: 'Identity', requires_consent: true }],
      oAuthApplicationName: 'Accounts Portal App',
      oAuthApplicationLogoUrl: 'https://example.com/ap-logo.png',
      oAuthApplicationUrl: 'https://example.com/ap',
      redirectUrl: 'https://example.com/callback',
      onAllow: onAllowSpy,
      onDeny: onDenySpy,
    } as any);

    mockOAuthApplication(fixtures.clerk, { getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfo) });

    const { getByText, baseElement } = render(<OAuthConsent />, { wrapper });

    // Context values win: the displayed name is the accounts portal one, not 'Clerk CLI'.
    await waitFor(() => expect(getByText('Accounts Portal App')).toBeVisible());

    // No forwarded hidden inputs inside the form when context callbacks are provided.
    const form = baseElement.querySelector('form[action*="/v1/me/oauth/consent/"]')!;
    expect(form).not.toBeNull();
    const forwardedInputs = form.querySelectorAll('input[type="hidden"]');
    expect(forwardedInputs.length).toBe(0);

    // Clicking Allow invokes the context callback, not a form submission.
    getByText('Allow').click();
    expect(onAllowSpy).toHaveBeenCalledTimes(1);

    // The hook should NOT fire a FAPI request on the accounts portal path.
    expect(fixtures.clerk.oauthApplication.getConsentInfo).not.toHaveBeenCalled();
  });

  it('shows missing client_id error in the public flow', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: {
        ...window.location,
        search: '',
        href: 'https://app.example/',
      },
    });

    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['jane@example.com'] });
    });

    mockOAuthApplication(fixtures.clerk, { getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfo) });

    props.setProps({ componentName: 'OAuthConsent' } as any);

    const { getByText } = render(<OAuthConsent />, { wrapper });

    await waitFor(() => {
      expect(getByText(/client ID is missing/i)).toBeVisible();
    });
  });

  it('shows missing redirect_uri error in the public flow', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: {
        ...window.location,
        search: '?client_id=client_test',
        href: 'https://app.example/?client_id=client_test',
      },
    });

    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['jane@example.com'] });
    });

    mockOAuthApplication(fixtures.clerk, { getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfo) });

    props.setProps({ componentName: 'OAuthConsent' } as any);

    const { getByText } = render(<OAuthConsent />, { wrapper });

    await waitFor(() => {
      expect(getByText(/redirect URI is missing/i)).toBeVisible();
    });
  });

  it('shows error message when the consent fetch fails in the public flow', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['jane@example.com'] });
    });

    mockOAuthApplication(fixtures.clerk, {
      getConsentInfo: vi.fn().mockRejectedValue(new Error('Invalid OAuth client')),
    });

    props.setProps({ componentName: 'OAuthConsent' } as any);

    const { getByText } = render(<OAuthConsent />, { wrapper });

    await waitFor(() => {
      expect(getByText(/Invalid OAuth client/i)).toBeVisible();
    });
  });

  describe('org selection', () => {
    it('does not render the org selector when user:org:read scope is absent', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['jane@example.com'],
          organization_memberships: [{ id: 'org_1', name: 'Acme Corp' }],
        });
        f.withOrganizations();
      });

      props.setProps({ componentName: 'OAuthConsent' } as any);
      mockOAuthApplication(fixtures.clerk, { getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfo) });

      const { queryByRole } = render(<OAuthConsent />, { wrapper });

      await waitFor(() => {
        expect(queryByRole('combobox')).toBeNull();
      });
    });

    it('does not render the org selector when organizations feature is disabled in the dashboard', async () => {
      // SDK-63: user:org:read scope is present but organizationSettings.enabled is false,
      // so no org select and no useOrganizationList call.
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['jane@example.com'],
          organization_memberships: [{ id: 'org_1', name: 'Acme Corp' }],
        });
        // intentionally NOT calling f.withOrganizations()
      });

      props.setProps({ componentName: 'OAuthConsent' } as any);
      mockOAuthApplication(fixtures.clerk, {
        getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfoWithOrgScope),
      });

      const { queryByRole } = render(<OAuthConsent />, { wrapper });

      await waitFor(() => {
        expect(queryByRole('combobox')).toBeNull();
      });
    });

    it('renders the org selector when user:org:read scope is present and user has memberships', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['jane@example.com'],
          organization_memberships: [{ id: 'org_1', name: 'Acme Corp' }],
        });
        f.withOrganizations();
      });

      props.setProps({ componentName: 'OAuthConsent' } as any);
      mockOAuthApplication(fixtures.clerk, {
        getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfoWithOrgScope),
      });

      const { getByText } = render(<OAuthConsent />, { wrapper });

      await waitFor(() => {
        expect(getByText('Acme Corp')).toBeVisible();
      });
    });

    it('renders the org selector when __internal_enableOrgSelection is true (fallback for existing apps)', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['jane@example.com'],
          organization_memberships: [{ id: 'org_1', name: 'Acme Corp' }],
        });
        f.withOrganizations();
      });

      props.setProps({ componentName: 'OAuthConsent', __internal_enableOrgSelection: true } as any);
      mockOAuthApplication(fixtures.clerk, { getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfo) });

      const { getByText } = render(<OAuthConsent />, { wrapper });

      await waitFor(() => {
        expect(getByText('Acme Corp')).toBeVisible();
      });
    });

    it('does not display user:org:read in the scopes list', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['jane@example.com'],
          organization_memberships: [{ id: 'org_1', name: 'Acme Corp' }],
        });
        f.withOrganizations();
      });

      props.setProps({ componentName: 'OAuthConsent' } as any);
      mockOAuthApplication(fixtures.clerk, {
        getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfoWithOrgScope),
      });

      const { queryByText } = render(<OAuthConsent />, { wrapper });

      await waitFor(() => {
        expect(queryByText('Access your organizations')).toBeNull();
      });
    });

    it('includes a hidden organization_id input when user:org:read scope is present and user has memberships', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['jane@example.com'],
          organization_memberships: [{ id: 'org_1', name: 'Acme Corp' }],
        });
        f.withOrganizations();
      });

      props.setProps({ componentName: 'OAuthConsent' } as any);
      mockOAuthApplication(fixtures.clerk, {
        getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfoWithOrgScope),
      });

      const { baseElement } = render(<OAuthConsent />, { wrapper });

      await waitFor(() => {
        const form = baseElement.querySelector('form[action*="/v1/me/oauth/consent/"]')!;
        const hiddenInput = form.querySelector('input[name="organization_id"]') as HTMLInputElement | null;
        expect(hiddenInput).not.toBeNull();
        expect(hiddenInput!.value).toBe('org_1');
      });
    });

    it('does not include organization_id in the form when user:org:read scope is absent', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({ email_addresses: ['jane@example.com'] });
      });

      props.setProps({ componentName: 'OAuthConsent' } as any);
      mockOAuthApplication(fixtures.clerk, { getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfo) });

      const { baseElement } = render(<OAuthConsent />, { wrapper });

      await waitFor(() => {
        const form = baseElement.querySelector('form[action*="/v1/me/oauth/consent/"]')!;
        expect(form.querySelector('input[name="organization_id"]')).toBeNull();
      });
    });

    it('defaults the selected org to session.lastActiveOrganizationId when it matches a membership', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['jane@example.com'],
          organization_memberships: [
            { id: 'org_1', name: 'Acme Corp' },
            { id: 'org_2', name: 'Globex' },
            { id: 'org_3', name: 'Initech' },
          ],
        });
        f.withOrganizations();
      });

      fixtures.clerk.session.lastActiveOrganizationId = 'org_3';

      props.setProps({ componentName: 'OAuthConsent' } as any);
      mockOAuthApplication(fixtures.clerk, {
        getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfoWithOrgScope),
      });

      const { baseElement } = render(<OAuthConsent />, { wrapper });

      await waitFor(() => {
        const form = baseElement.querySelector('form[action*="/v1/me/oauth/consent/"]')!;
        const hiddenInput = form.querySelector('input[name="organization_id"]') as HTMLInputElement | null;
        expect(hiddenInput).not.toBeNull();
        expect(hiddenInput!.value).toBe('org_3');
      });
    });

    it('falls back to the first membership when lastActiveOrganizationId does not match any membership', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['jane@example.com'],
          organization_memberships: [
            { id: 'org_1', name: 'Acme Corp' },
            { id: 'org_2', name: 'Globex' },
          ],
        });
        f.withOrganizations();
      });

      fixtures.clerk.session.lastActiveOrganizationId = 'org_deleted';

      props.setProps({ componentName: 'OAuthConsent' } as any);
      mockOAuthApplication(fixtures.clerk, {
        getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfoWithOrgScope),
      });

      const { baseElement } = render(<OAuthConsent />, { wrapper });

      await waitFor(() => {
        const form = baseElement.querySelector('form[action*="/v1/me/oauth/consent/"]')!;
        const hiddenInput = form.querySelector('input[name="organization_id"]') as HTMLInputElement | null;
        expect(hiddenInput).not.toBeNull();
        expect(hiddenInput!.value).toBe('org_1');
      });
    });

    it('falls back to the first membership when lastActiveOrganizationId is null', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({
          email_addresses: ['jane@example.com'],
          organization_memberships: [
            { id: 'org_1', name: 'Acme Corp' },
            { id: 'org_2', name: 'Globex' },
          ],
        });
        f.withOrganizations();
      });

      fixtures.clerk.session.lastActiveOrganizationId = null;

      props.setProps({ componentName: 'OAuthConsent' } as any);
      mockOAuthApplication(fixtures.clerk, {
        getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfoWithOrgScope),
      });

      const { baseElement } = render(<OAuthConsent />, { wrapper });

      await waitFor(() => {
        const form = baseElement.querySelector('form[action*="/v1/me/oauth/consent/"]')!;
        const hiddenInput = form.querySelector('input[name="organization_id"]') as HTMLInputElement | null;
        expect(hiddenInput).not.toBeNull();
        expect(hiddenInput!.value).toBe('org_1');
      });
    });
  });
});
