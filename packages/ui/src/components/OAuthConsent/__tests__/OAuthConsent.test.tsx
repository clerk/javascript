import { useOrganization, useOrganizationList } from '@clerk/shared/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { OAuthConsent } from '../OAuthConsent';

// Captures the onChange injected into SelectOptionList's useInView so tests
// can simulate "user scrolled to the bottom of the org dropdown".
let capturedLoadMoreOnChange: ((inView: boolean) => void) | undefined;

// Default: useOrganizationList returns no memberships and is not loaded.
// Individual tests override this mock to inject org data.
vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await (importOriginal as () => Promise<Record<string, unknown>>)();
  return {
    ...actual,
    useOrganizationList: vi.fn().mockReturnValue({
      isLoaded: false,
      userMemberships: { data: [], hasNextPage: false, fetchNext: vi.fn(), isLoading: false },
    }),
    useOrganization: vi.fn().mockReturnValue({ organization: null }),
  };
});

vi.mock('@/ui/hooks/useInView', () => ({
  useInView: vi.fn().mockImplementation(({ onChange }: { onChange?: (inView: boolean) => void }) => {
    capturedLoadMoreOnChange = onChange;
    return { ref: vi.fn(), inView: false };
  }),
}));

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
    capturedLoadMoreOnChange = undefined;
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

    // Simulate the accounts portal path: `clerk.__internal_mountOAuthConsent` is
    // called with the legacy `oAuth*` (capital-A) prop shape from
    // `__internal_OAuthConsentProps`. The `ComponentContextProvider` translates
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
    it('does not render the org selector when __internal_enableOrgSelection is not set', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({ email_addresses: ['jane@example.com'] });
      });

      props.setProps({ componentName: 'OAuthConsent' } as any);
      mockOAuthApplication(fixtures.clerk, { getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfo) });

      vi.mocked(useOrganizationList).mockReturnValue({
        isLoaded: true,
        userMemberships: {
          data: [
            {
              organization: { id: 'org_1', name: 'Acme Corp', imageUrl: 'https://img.clerk.com/static/clerk.png' },
            },
          ],
        },
      } as any);

      const { queryByRole } = render(<OAuthConsent />, { wrapper });

      await waitFor(() => {
        expect(queryByRole('combobox')).toBeNull();
      });
    });

    it('renders the org selector when __internal_enableOrgSelection is true and orgs are loaded', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({ email_addresses: ['jane@example.com'] });
      });

      props.setProps({ componentName: 'OAuthConsent', __internal_enableOrgSelection: true } as any);
      mockOAuthApplication(fixtures.clerk, { getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfo) });

      vi.mocked(useOrganizationList).mockReturnValue({
        isLoaded: true,
        userMemberships: {
          data: [
            {
              organization: { id: 'org_1', name: 'Acme Corp', imageUrl: 'https://img.clerk.com/static/clerk.png' },
            },
          ],
        },
      } as any);

      const { getByText } = render(<OAuthConsent />, { wrapper });

      await waitFor(() => {
        expect(getByText('Acme Corp')).toBeVisible();
      });
    });

    it('includes a hidden organization_id input in the form when org selection is enabled and an org is selected', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({ email_addresses: ['jane@example.com'] });
      });

      props.setProps({ componentName: 'OAuthConsent', __internal_enableOrgSelection: true } as any);
      mockOAuthApplication(fixtures.clerk, { getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfo) });

      vi.mocked(useOrganizationList).mockReturnValue({
        isLoaded: true,
        userMemberships: {
          data: [
            {
              organization: { id: 'org_1', name: 'Acme Corp', imageUrl: 'https://img.clerk.com/static/clerk.png' },
            },
          ],
        },
      } as any);

      const { baseElement } = render(<OAuthConsent />, { wrapper });

      await waitFor(() => {
        const form = baseElement.querySelector('form[action*="/v1/me/oauth/consent/"]')!;
        const hiddenInput = form.querySelector('input[name="organization_id"]') as HTMLInputElement | null;
        expect(hiddenInput).not.toBeNull();
        expect(hiddenInput!.value).toBe('org_1');
      });
    });

    it('does not include organization_id in the form when org selection is disabled', async () => {
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
  });

  describe('org selection — infinite scroll and active-org pre-selection', () => {
    const twoOrgs = [
      { organization: { id: 'org_1', name: 'Acme Corp', imageUrl: 'https://img.clerk.com/static/clerk.png' } },
      { organization: { id: 'org_2', name: 'Beta Inc', imageUrl: 'https://img.clerk.com/static/beta.png' } },
    ];

    it('wires the load-more sentinel to the onLoadMore callback', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({ email_addresses: ['jane@example.com'] });
      });

      props.setProps({ componentName: 'OAuthConsent', __internal_enableOrgSelection: true } as any);
      mockOAuthApplication(fixtures.clerk, { getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfo) });

      vi.mocked(useOrganizationList).mockReturnValue({
        isLoaded: true,
        userMemberships: { data: twoOrgs, hasNextPage: false, fetchNext: vi.fn(), isLoading: false },
      } as any);

      render(<OAuthConsent />, { wrapper });

      // The load-more sentinel is always wired up when enableOrgSelection is true
      // (syntheticHasMore starts at true since syntheticPage=1 < 4)
      await waitFor(() => {
        expect(capturedLoadMoreOnChange).toBeDefined();
      });

      // Calling it should not throw — it calls syntheticFetchNext which updates state
      expect(() => capturedLoadMoreOnChange!(true)).not.toThrow();
    });

    it('pre-selects the active organization when the session has one', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({ email_addresses: ['jane@example.com'] });
      });

      props.setProps({ componentName: 'OAuthConsent', __internal_enableOrgSelection: true } as any);
      mockOAuthApplication(fixtures.clerk, { getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfo) });

      vi.mocked(useOrganizationList).mockReturnValue({
        isLoaded: true,
        userMemberships: { data: twoOrgs, hasNextPage: false, fetchNext: vi.fn(), isLoading: false },
      } as any);

      // Active org is org_2 — second in list, not first, to prove ordering matters
      vi.mocked(useOrganization).mockReturnValue({ organization: { id: 'org_2' } } as any);

      const { baseElement } = render(<OAuthConsent />, { wrapper });

      await waitFor(() => {
        const form = baseElement.querySelector('form[action*="/v1/me/oauth/consent/"]')!;
        const hiddenInput = form.querySelector('input[name="organization_id"]') as HTMLInputElement | null;
        expect(hiddenInput?.value).toBe('org_2');
      });
    });

    it('falls back to the first org when the session has no active organization', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({ email_addresses: ['jane@example.com'] });
      });

      props.setProps({ componentName: 'OAuthConsent', __internal_enableOrgSelection: true } as any);
      mockOAuthApplication(fixtures.clerk, { getConsentInfo: vi.fn().mockResolvedValue(fakeConsentInfo) });

      vi.mocked(useOrganizationList).mockReturnValue({
        isLoaded: true,
        userMemberships: { data: twoOrgs, hasNextPage: false, fetchNext: vi.fn(), isLoading: false },
      } as any);

      vi.mocked(useOrganization).mockReturnValue({ organization: null } as any);

      const { baseElement } = render(<OAuthConsent />, { wrapper });

      await waitFor(() => {
        const form = baseElement.querySelector('form[action*="/v1/me/oauth/consent/"]')!;
        const hiddenInput = form.querySelector('input[name="organization_id"]') as HTMLInputElement | null;
        expect(hiddenInput?.value).toBe('org_1');
      });
    });
  });
});
