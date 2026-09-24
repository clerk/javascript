import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SignUpField, SignUpResource } from '@/types';

import { completeSignUpFlow } from '../completeSignUpFlow';

const mockHandleComplete = vi.fn();
const mockNavigate = vi.fn();
const mockAuthenticateWithRedirect = vi.fn();

describe('completeSignUpFlow', () => {
  beforeEach(() => {
    mockHandleComplete.mockReset();
    mockNavigate.mockReset();
    mockAuthenticateWithRedirect.mockReset();
  });

  it('calls handleComplete if sign up is complete', async () => {
    const mockSignUp = {
      status: 'complete',
      missingFields: [] as SignUpField[],
    } as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockHandleComplete).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('removes ticket query parameters before calling handleComplete', async () => {
    const mockSignUp = {
      status: 'complete',
      missingFields: [] as SignUpField[],
    } as SignUpResource;
    let currentUrl = new URL(
      'http://localhost/sign-up/continue?__clerk_ticket=test_ticket&__clerk_invitation_token=test_invitation',
    );
    let ticketAtHandleComplete: string | null | undefined;
    let invitationAtHandleComplete: string | null | undefined;

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        get href() {
          return currentUrl.href;
        },
        get search() {
          return currentUrl.search;
        },
      },
    });
    Object.defineProperty(window, 'history', {
      configurable: true,
      value: {
        state: undefined,
        replaceState: vi.fn((_state, _title, url) => {
          currentUrl = new URL(url, currentUrl);
        }),
      },
    });
    mockHandleComplete.mockImplementationOnce(() => {
      ticketAtHandleComplete = currentUrl.searchParams.get('__clerk_ticket');
      invitationAtHandleComplete = currentUrl.searchParams.get('__clerk_invitation_token');
    });

    await completeSignUpFlow({
      signUp: mockSignUp,
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(ticketAtHandleComplete).toBeNull();
    expect(invitationAtHandleComplete).toBeNull();
  });

  it('navigates to verify email page if email still unverified', async () => {
    const mockSignUp = {
      status: 'missing_requirements',
      missingFields: [] as SignUpField[],
      unverifiedFields: ['email_address', 'phone_number'],
    } as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      verifyEmailPath: 'verify-email',
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockHandleComplete).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('verify-email', { searchParams: new URLSearchParams() });
  });

  it('navigates to verify phone page if phone still unverified', async () => {
    const mockSignUp = {
      status: 'missing_requirements',
      missingFields: [] as SignUpField[],
      unverifiedFields: ['phone_number'],
    } as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      verifyPhonePath: 'verify-phone',
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockHandleComplete).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('verify-phone', { searchParams: new URLSearchParams() });
  });

  it('navigates to protect check page if protect_check is a missing field', async () => {
    const mockSignUp = {
      status: 'missing_requirements',
      missingFields: ['protect_check'] as SignUpField[],
      unverifiedFields: ['email_address'],
    } as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      protectCheckPath: 'protect-check',
      verifyEmailPath: 'verify-email',
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockHandleComplete).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('protect-check', { searchParams: new URLSearchParams() });
  });

  it('navigates to protect check page when protectCheck field is present even without missing_fields entry', async () => {
    const mockSignUp = {
      status: 'missing_requirements',
      missingFields: [] as SignUpField[],
      unverifiedFields: ['email_address'],
      protectCheck: {
        status: 'pending',
        token: 't',
        sdkUrl: 'https://example.com/sdk.js',
      },
    } as unknown as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      protectCheckPath: 'protect-check',
      verifyEmailPath: 'verify-email',
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockNavigate).toHaveBeenCalledWith('protect-check', { searchParams: new URLSearchParams() });
  });

  it('skips protect check if no protectCheckPath is provided', async () => {
    const mockSignUp = {
      status: 'missing_requirements',
      missingFields: ['protect_check'] as SignUpField[],
      unverifiedFields: ['email_address'],
    } as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      verifyEmailPath: 'verify-email',
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockNavigate).toHaveBeenCalledWith('verify-email', { searchParams: new URLSearchParams() });
  });

  it('prioritizes enterprise_sso over protect_check', async () => {
    const mockSignUp = {
      status: 'missing_requirements',
      missingFields: ['enterprise_sso', 'protect_check'] as SignUpField[],
      authenticateWithRedirect: mockAuthenticateWithRedirect,
    } as unknown as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      protectCheckPath: 'protect-check',
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
      redirectUrl: 'https://example.com/acs',
      redirectUrlComplete: 'https://example.com/done',
    });

    expect(mockAuthenticateWithRedirect).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does nothing in any other case', async () => {
    const mockSignUp = {
      status: 'missing_requirements',
      missingFields: [] as SignUpField[],
    } as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockHandleComplete).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('initiates a Enterprise SSO flow if enterprise_sso is listed as a missing field', async () => {
    const redirectUrl = 'https://www.in.gr/acs';
    const redirectUrlComplete = 'https://www.in.gr/tada';

    const mockSignUp = {
      status: 'missing_requirements',
      missingFields: ['enterprise_sso'],
      authenticateWithRedirect: mockAuthenticateWithRedirect,
    } as unknown as SignUpResource;

    await completeSignUpFlow({
      signUp: mockSignUp,
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
      redirectUrl: 'https://www.in.gr/acs',
      redirectUrlComplete: 'https://www.in.gr/tada',
    });

    expect(mockHandleComplete).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
      strategy: 'enterprise_sso',
      redirectUrl,
      redirectUrlComplete,
      continueSignUp: true,
    });
  });

  it.each([
    ['redirectUrl is missing', { redirectUrlComplete: 'https://example.com/done' }],
    ['redirectUrlComplete is missing', { redirectUrl: 'https://example.com/acs' }],
    ['both are missing', {}],
    ['redirectUrl is empty', { redirectUrl: '', redirectUrlComplete: 'https://example.com/done' }],
    ['redirectUrlComplete is empty', { redirectUrl: 'https://example.com/acs', redirectUrlComplete: '' }],
  ])('throws rather than starting an Enterprise SSO flow when %s', (_label, urls) => {
    const mockSignUp = {
      status: 'missing_requirements',
      missingFields: ['enterprise_sso'],
      authenticateWithRedirect: mockAuthenticateWithRedirect,
    } as unknown as SignUpResource;

    expect(() =>
      completeSignUpFlow({
        signUp: mockSignUp,
        handleComplete: mockHandleComplete,
        navigate: mockNavigate,
        ...urls,
      }),
    ).toThrow(/redirectUrl/);

    expect(mockAuthenticateWithRedirect).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockHandleComplete).not.toHaveBeenCalled();
  });

  it('forwards clerk ticket and status query params when navigating to verify email', async () => {
    const mockSignUp = {
      status: 'missing_requirements',
      missingFields: [] as SignUpField[],
      unverifiedFields: ['email_address'],
    } as SignUpResource;

    Object.defineProperty(window, 'location', {
      value: {
        search: '?__clerk_ticket=test_ticket&__clerk_status=verified&custom_param=value',
      },
      writable: true,
    });

    await completeSignUpFlow({
      signUp: mockSignUp,
      verifyEmailPath: 'verify-email',
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockHandleComplete).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('verify-email', {
      searchParams: expect.any(URLSearchParams),
    });

    const searchParams = mockNavigate.mock.calls[0][1].searchParams;
    expect(searchParams.get('__clerk_ticket')).toBe('test_ticket');
    expect(searchParams.get('__clerk_status')).toBe('verified');
    expect(searchParams.get('custom_param')).toBeNull();
  });

  it('forwards clerk ticket and status query params when navigating to verify phone', async () => {
    const mockSignUp = {
      status: 'missing_requirements',
      missingFields: [] as SignUpField[],
      unverifiedFields: ['phone_number'],
    } as SignUpResource;

    Object.defineProperty(window, 'location', {
      value: {
        search: '?__clerk_ticket=test_ticket&__clerk_status=verified&custom_param=value',
      },
      writable: true,
    });

    await completeSignUpFlow({
      signUp: mockSignUp,
      verifyPhonePath: 'verify-phone',
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockHandleComplete).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('verify-phone', {
      searchParams: expect.any(URLSearchParams),
    });

    const searchParams = mockNavigate.mock.calls[0][1].searchParams;
    expect(searchParams.get('__clerk_ticket')).toBe('test_ticket');
    expect(searchParams.get('__clerk_status')).toBe('verified');
    expect(searchParams.get('custom_param')).toBeNull();
  });

  it('forwards clerk ticket and status query params when navigating to continue path', async () => {
    const mockSignUp = {
      status: 'missing_requirements',
      missingFields: [] as SignUpField[],
    } as SignUpResource;

    Object.defineProperty(window, 'location', {
      value: {
        search: '?__clerk_ticket=test_ticket&__clerk_status=verified&custom_param=value',
      },
      writable: true,
    });

    await completeSignUpFlow({
      signUp: mockSignUp,
      continuePath: 'continue',
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockHandleComplete).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('continue', {
      searchParams: expect.any(URLSearchParams),
    });

    const searchParams = mockNavigate.mock.calls[0][1].searchParams;
    expect(searchParams.get('__clerk_ticket')).toBe('test_ticket');
    expect(searchParams.get('__clerk_status')).toBe('verified');
    expect(searchParams.get('custom_param')).toBeNull();
  });

  it('handles missing clerk query params gracefully', async () => {
    const mockSignUp = {
      status: 'missing_requirements',
      missingFields: [] as SignUpField[],
      unverifiedFields: ['email_address'],
    } as SignUpResource;

    Object.defineProperty(window, 'location', {
      value: {
        search: '?custom_param=value',
      },
      writable: true,
    });

    await completeSignUpFlow({
      signUp: mockSignUp,
      verifyEmailPath: 'verify-email',
      handleComplete: mockHandleComplete,
      navigate: mockNavigate,
    });

    expect(mockHandleComplete).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('verify-email', {
      searchParams: expect.any(URLSearchParams),
    });

    const searchParams = mockNavigate.mock.calls[0][1].searchParams;
    expect(searchParams.get('__clerk_ticket')).toBeNull();
    expect(searchParams.get('__clerk_status')).toBeNull();
    expect(searchParams.get('custom_param')).toBeNull();
  });
});
