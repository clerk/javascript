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

/**
 * `oauthApplication` is a getter on the Clerk prototype and cannot be assigned
 * directly. Use Object.defineProperty to replace it with a configurable mock.
 */
function mockOAuthApplication(clerkInstance: any, impl: { getConsentInfo: ReturnType<typeof vi.fn> }) {
  Object.defineProperty(clerkInstance, 'oauthApplication', {
    configurable: true,
    get: () => impl,
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
        search: '?client_id=client_test',
        href: 'https://app.example/?client_id=client_test',
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
      const form = baseElement.querySelector('form[action*="/v1/internal/oauth-consent"]');
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
    const form = baseElement.querySelector('form[action*="/v1/internal/oauth-consent"]')!;

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
    const form = baseElement.querySelector('form[action*="/v1/internal/oauth-consent"]')!;

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

    const { container } = render(<OAuthConsent />, { wrapper });

    expect(container.firstChild).toBeNull();
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
    const form = baseElement.querySelector('form[action*="/v1/internal/oauth-consent"]')!;
    expect(form).not.toBeNull();
    const forwardedInputs = form.querySelectorAll('input[type="hidden"]');
    expect(forwardedInputs.length).toBe(0);

    // Clicking Allow invokes the context callback, not a form submission.
    getByText('Allow').click();
    expect(onAllowSpy).toHaveBeenCalledTimes(1);
  });
});
