import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { OAuthDeviceVerificationInfo } from '@clerk/shared/types';
import { act, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { OAuthDeviceVerification } from '../OAuthDeviceVerification';

const { createFixtures } = bindCreateFixtures('OAuthDeviceVerification');

const verificationInfo: OAuthDeviceVerificationInfo = {
  oauthApplicationName: 'TV App',
  oauthApplicationLogoUrl: 'https://example.com/tv.png',
  clientId: 'client_device',
  scopes: [
    { scope: 'openid', description: 'View your identity', requiresConsent: true },
    { scope: 'email', description: 'Access your email address', requiresConsent: true },
  ],
  status: 'pending',
  expiresAt: 1_800_000_000_000,
};

function apiError(code: string, status = 400) {
  return new ClerkAPIResponseError(code, {
    data: [{ code, message: code }],
    status,
  });
}

function mockOAuthApplication(
  clerkInstance: any,
  overrides: {
    lookupDeviceVerification?: ReturnType<typeof vi.fn>;
    submitDeviceVerification?: ReturnType<typeof vi.fn>;
  } = {},
) {
  const oauthApplication = {
    lookupDeviceVerification: vi.fn().mockResolvedValue(verificationInfo),
    submitDeviceVerification: vi.fn().mockResolvedValue({
      object: 'oauth_device_verification',
      status: 'approved',
    }),
    ...overrides,
  };
  Object.defineProperty(clerkInstance, 'oauthApplication', {
    configurable: true,
    get: () => oauthApplication,
  });
  return oauthApplication;
}

describe('OAuthDeviceVerification', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { ...originalLocation, search: '', href: 'https://accounts.example/device' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
    vi.clearAllMocks();
  });

  async function setup(info: OAuthDeviceVerificationInfo = verificationInfo) {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['jane@example.com'] });
    });
    props.setProps({ componentName: 'OAuthDeviceVerification' } as any);
    const oauthApplication = mockOAuthApplication(fixtures.clerk, {
      lookupDeviceVerification: vi.fn().mockResolvedValue(info),
    });
    return { wrapper, fixtures, oauthApplication };
  }

  it('uses a grouped OTP input and normalizes a forgiving entry', async () => {
    const { wrapper, oauthApplication } = await setup();
    const { getAllByTestId, getByLabelText, getByRole, getByTestId, getByText, userEvent } = render(
      <OAuthDeviceVerification />,
      { wrapper },
    );

    await userEvent.type(getByLabelText('Device code'), 'bfws zbzm');
    expect(getByLabelText('Device code')).toHaveValue('BFWSZBZM');
    expect(getAllByTestId('otp-input-segment')).toHaveLength(8);
    expect(getByTestId('device-code-separator')).toHaveTextContent('-');
    await userEvent.click(getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(getByText('Allow TV App to access your account?')).toBeVisible());
    expect(oauthApplication.lookupDeviceVerification).toHaveBeenCalledOnce();
    expect(oauthApplication.lookupDeviceVerification).toHaveBeenCalledWith({ userCode: 'BFWSZBZM' });
    expect(getByText('View your identity')).toBeVisible();
    expect(getByText('Access your email address')).toBeVisible();
    expect(getByText('Confirm this request for jane@example.com')).toBeVisible();
    expect(getByText('Only approve this request if you started it on your other device.')).toBeVisible();
  });

  it('looks up a valid URL prefill exactly once and skips entry', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '?user_code=bfws%20-zbzm' },
    });
    const { wrapper, oauthApplication } = await setup();
    const { getByText, queryByRole } = render(<OAuthDeviceVerification />, { wrapper });

    await waitFor(() => expect(getByText('Allow TV App to access your account?')).toBeVisible());
    expect(oauthApplication.lookupDeviceVerification).toHaveBeenCalledOnce();
    expect(oauthApplication.lookupDeviceVerification).toHaveBeenCalledWith({ userCode: 'BFWSZBZM' });
    expect(queryByRole('button', { name: 'Continue' })).toBeNull();
  });

  it('matches OAuthConsent scope display behavior', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '?user_code=BFWS-ZBZM' },
    });
    const { wrapper } = await setup({
      ...verificationInfo,
      scopes: [
        ...verificationInfo.scopes,
        { scope: 'offline_access', description: 'Offline access', requiresConsent: true },
        { scope: 'private_metadata', description: 'Raw API description', requiresConsent: true },
      ],
    });
    const { getByText, queryByText } = render(<OAuthDeviceVerification />, { wrapper });

    await waitFor(() => expect(getByText('Allow TV App to access your account?')).toBeVisible());
    expect(queryByText('Offline access')).toBeNull();
    expect(queryByText('offline_access')).toBeNull();
    expect(queryByText('Raw API description')).toBeNull();
    expect(getByText('Your private metadata set by TestApp, which may include sensitive information')).toBeVisible();
    expect(getByText("You'll stay signed in until you sign out or revoke access.")).toBeVisible();
  });

  it('keeps an invalid URL prefill editable without calling FAPI', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '?user_code=AEIO-1234' },
    });
    const { wrapper, oauthApplication } = await setup();
    const { getAllByText, getByLabelText } = render(<OAuthDeviceVerification />, { wrapper });

    await waitFor(() => expect(getAllByText('Enter a valid 8-character code.').length).toBeGreaterThan(0));
    expect(getByLabelText('Device code')).toHaveValue('AEIO1234');
    expect(oauthApplication.lookupDeviceVerification).not.toHaveBeenCalled();
  });

  it('renders unknown-code errors inline and leaves the input editable', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['jane@example.com'] });
    });
    props.setProps({ componentName: 'OAuthDeviceVerification' } as any);
    const oauthApplication = mockOAuthApplication(fixtures.clerk, {
      lookupDeviceVerification: vi.fn().mockRejectedValue(apiError('resource_not_found', 404)),
    });
    const { getAllByText, getByLabelText, getByRole, userEvent } = render(<OAuthDeviceVerification />, { wrapper });

    await userEvent.type(getByLabelText('Device code'), 'bfwszbzm');
    await userEvent.click(getByRole('button', { name: 'Continue' }));

    await waitFor(() =>
      expect(getAllByText("We couldn't find that code. Check it and try again.").length).toBeGreaterThan(0),
    );
    expect(getByLabelText('Device code')).toBeEnabled();
    expect(oauthApplication.lookupDeviceVerification).toHaveBeenCalledOnce();
  });

  it.each([
    ['oauth_device_code_expired', 'This code expired', 'Start over on your device.'],
    ['too_many_requests', 'Too many incorrect attempts', 'Wait before trying another code.'],
  ])('renders the %s lookup error distinctly without retrying', async (code, title, subtitle) => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '?user_code=BFWS-ZBZM' },
    });
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['jane@example.com'] });
    });
    props.setProps({ componentName: 'OAuthDeviceVerification' } as any);
    const lookup = vi.fn().mockRejectedValue(apiError(code, code === 'too_many_requests' ? 429 : 400));
    mockOAuthApplication(fixtures.clerk, { lookupDeviceVerification: lookup });
    const { getByText } = render(<OAuthDeviceVerification />, { wrapper });

    await waitFor(() => expect(getByText(title)).toBeVisible());
    expect(getByText(subtitle)).toBeVisible();
    expect(lookup).toHaveBeenCalledOnce();
  });

  it.each([
    ['approved', "You've approved this", 'Return to your device to continue.'],
    ['denied', 'This request was denied', 'Start over on your device if you want to try again.'],
    ['consumed', 'This code has already been used', 'Your device is authorized. You can close this window.'],
  ] as const)('renders lookup status %s as an actionless past-tense report', async (status, title, subtitle) => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '?user_code=BFWS-ZBZM' },
    });
    const { wrapper } = await setup({ ...verificationInfo, status });
    const { getByText, queryByRole, queryByText } = render(<OAuthDeviceVerification />, { wrapper });

    await waitFor(() => expect(getByText(title)).toBeVisible());
    expect(getByText(subtitle)).toBeVisible();
    expect(queryByRole('button')).toBeNull();
    expect(queryByText('Device approved')).toBeNull();
  });

  it('falls back to a recoverable error view for an unrecognized lookup status', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '?user_code=BFWS-ZBZM' },
    });
    const { wrapper } = await setup({
      ...verificationInfo,
      status: 'revoked',
    } as unknown as OAuthDeviceVerificationInfo);
    const { getByRole, getByText } = render(<OAuthDeviceVerification />, { wrapper });

    await waitFor(() => expect(getByText('We could not verify this code')).toBeVisible());
    expect(getByRole('button', { name: 'Enter another code' })).toBeVisible();
  });

  it.each([
    ['Approve', 'approved', 'Device approved', 'You approved this request. Return to your device to continue.'],
    ['Deny', 'denied', 'Access denied', 'You denied this request. Return to your device.'],
  ] as const)('submits %s once and renders a fresh-decision state', async (action, status, title, subtitle) => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '?user_code=BFWS-ZBZM' },
    });
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['jane@example.com'] });
    });
    props.setProps({ componentName: 'OAuthDeviceVerification' } as any);
    const submit = vi.fn().mockResolvedValue({ object: 'oauth_device_verification', status });
    mockOAuthApplication(fixtures.clerk, { submitDeviceVerification: submit });
    const { getByRole, getByText, userEvent } = render(<OAuthDeviceVerification />, { wrapper });

    await waitFor(() => expect(getByRole('button', { name: action })).toBeVisible());
    await userEvent.click(getByRole('button', { name: action }));

    await waitFor(() => expect(getByText(title)).toBeVisible());
    expect(getByText(subtitle)).toBeVisible();
    expect(submit).toHaveBeenCalledOnce();
    expect(submit).toHaveBeenCalledWith({ userCode: 'BFWSZBZM', approved: action === 'Approve' });
  });

  it.each([
    ['Approve', 'Deny', 'approved', 'Device approved'],
    ['Deny', 'Approve', 'denied', 'Access denied'],
  ] as const)('shows the decision spinner only on %s', async (action, otherAction, status, terminalTitle) => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '?user_code=BFWS-ZBZM' },
    });
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['jane@example.com'] });
    });
    props.setProps({ componentName: 'OAuthDeviceVerification' } as any);
    let resolveSubmit: ((value: { object: string; status: string }) => void) | undefined;
    mockOAuthApplication(fixtures.clerk, {
      submitDeviceVerification: vi.fn().mockImplementation(
        () =>
          new Promise(resolve => {
            resolveSubmit = resolve;
          }),
      ),
    });
    const { getByRole, userEvent } = render(<OAuthDeviceVerification />, { wrapper });

    const actionButton = await waitFor(() => getByRole('button', { name: action }));
    const otherButton = getByRole('button', { name: otherAction });
    await userEvent.click(actionButton);

    await waitFor(() => expect(within(actionButton).getByLabelText('Loading')).toBeVisible());
    expect(within(otherButton).queryByLabelText('Loading')).toBeNull();

    await act(async () => {
      resolveSubmit?.({ object: 'oauth_device_verification', status });
      await Promise.resolve();
    });
    await waitFor(() => expect(getByRole('heading', { name: terminalTitle })).toBeVisible());
  });

  it('renders an already-decided report without success copy for a decision-time bad_request', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '?user_code=BFWS-ZBZM' },
    });
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['jane@example.com'] });
    });
    props.setProps({ componentName: 'OAuthDeviceVerification' } as any);
    mockOAuthApplication(fixtures.clerk, {
      submitDeviceVerification: vi.fn().mockRejectedValue(apiError('bad_request')),
    });
    const { getByRole, getByText, queryByRole, queryByText, userEvent } = render(<OAuthDeviceVerification />, {
      wrapper,
    });

    await waitFor(() => expect(getByRole('button', { name: 'Approve' })).toBeVisible());
    await userEvent.click(getByRole('button', { name: 'Approve' }));

    await waitFor(() => expect(getByText('This request was already completed')).toBeVisible());
    expect(getByText('It was decided elsewhere. Return to your device.')).toBeVisible();
    expect(queryByText('Device approved')).toBeNull();
    expect(queryByText('Access denied')).toBeNull();
    expect(queryByRole('button')).toBeNull();
  });

  it('shows and defaults the organization picker only for user:org:read when organizations are enabled', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '?user_code=BFWS-ZBZM' },
    });
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
    fixtures.clerk.session.lastActiveOrganizationId = 'org_2';
    props.setProps({ componentName: 'OAuthDeviceVerification' } as any);
    const submit = vi.fn().mockResolvedValue({ object: 'oauth_device_verification', status: 'approved' });
    mockOAuthApplication(fixtures.clerk, {
      lookupDeviceVerification: vi.fn().mockResolvedValue({
        ...verificationInfo,
        scopes: [
          ...verificationInfo.scopes,
          { scope: 'user:org:read', description: 'Access your organizations', requiresConsent: true },
        ],
      }),
      submitDeviceVerification: submit,
    });
    const { getByRole, getByText, userEvent } = render(<OAuthDeviceVerification />, { wrapper });

    await waitFor(() => expect(getByText('Globex')).toBeVisible());
    await userEvent.click(getByRole('button', { name: 'Approve' }));
    expect(submit).toHaveBeenCalledWith({ userCode: 'BFWSZBZM', approved: true, organizationId: 'org_2' });
  });

  it('does not show the organization picker without user:org:read', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '?user_code=BFWS-ZBZM' },
    });
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({
        email_addresses: ['jane@example.com'],
        organization_memberships: [{ id: 'org_1', name: 'Acme Corp' }],
      });
      f.withOrganizations();
    });
    props.setProps({ componentName: 'OAuthDeviceVerification' } as any);
    mockOAuthApplication(fixtures.clerk);
    const { getByText, queryByRole } = render(<OAuthDeviceVerification />, { wrapper });

    await waitFor(() => expect(getByText('Allow TV App to access your account?')).toBeVisible());
    expect(queryByRole('combobox')).toBeNull();
  });

  it('does not show the organization picker when organizations are disabled', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '?user_code=BFWS-ZBZM' },
    });
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({
        email_addresses: ['jane@example.com'],
        organization_memberships: [{ id: 'org_1', name: 'Acme Corp' }],
      });
    });
    props.setProps({ componentName: 'OAuthDeviceVerification' } as any);
    mockOAuthApplication(fixtures.clerk, {
      lookupDeviceVerification: vi.fn().mockResolvedValue({
        ...verificationInfo,
        scopes: [
          ...verificationInfo.scopes,
          { scope: 'user:org:read', description: 'Access your organizations', requiresConsent: true },
        ],
      }),
    });
    const { getByText, queryByRole } = render(<OAuthDeviceVerification />, { wrapper });

    await waitFor(() => expect(getByText('Allow TV App to access your account?')).toBeVisible());
    expect(queryByRole('combobox')).toBeNull();
  });

  it('uses the application-name fallback when no logo is provided', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '?user_code=BFWS-ZBZM' },
    });
    const { wrapper } = await setup({ ...verificationInfo, oauthApplicationLogoUrl: null });
    const { getByText, queryByAltText } = render(<OAuthDeviceVerification />, { wrapper });

    await waitFor(() => expect(getByText('Allow TV App to access your account?')).toBeVisible());
    expect(queryByAltText('TV App')).toBeNull();
  });

  it('renders nothing and makes no request when unauthenticated', async () => {
    const { wrapper, fixtures, props } = await createFixtures();
    props.setProps({ componentName: 'OAuthDeviceVerification' } as any);
    const oauthApplication = mockOAuthApplication(fixtures.clerk);
    const { queryByText } = render(<OAuthDeviceVerification />, { wrapper });

    expect(queryByText('Verify a device')).toBeNull();
    expect(oauthApplication.lookupDeviceVerification).not.toHaveBeenCalled();
  });
});
