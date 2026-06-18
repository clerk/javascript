import { ClerkAPIResponseError } from '@clerk/shared/error';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Handoff } from '../Handoff';

const mockClerkNavigate = vi.fn();
const mockCustomNavigate = vi.fn();
const mockSetActive = vi.fn();
const mockSignInCreate = vi.fn();
const mockSignUpCreate = vi.fn();
const mockBuildAfterSignInUrl = vi.fn();
const mockBuildAfterSignUpUrl = vi.fn();
const mockBuildSignInUrl = vi.fn();
const mockBuildSignUpUrl = vi.fn();

let mockClerkLoaded = true;
let mockUser: unknown = null;
let mockSession: unknown = null;
let mockSetActiveSession: Record<string, unknown> = { id: 'sess_active' };

vi.mock('../../../src/hooks', () => ({
  useClerk: () => ({
    loaded: mockClerkLoaded,
    user: mockUser,
    session: mockSession,
    client: {
      signIn: {
        create: mockSignInCreate,
      },
      signUp: {
        create: mockSignUpCreate,
      },
    },
    navigate: mockClerkNavigate,
    setActive: mockSetActive,
    buildAfterSignInUrl: mockBuildAfterSignInUrl,
    buildAfterSignUpUrl: mockBuildAfterSignUpUrl,
    buildSignInUrl: mockBuildSignInUrl,
    buildSignUpUrl: mockBuildSignUpUrl,
  }),
}));

const signInResource = (overrides: Record<string, unknown> = {}) => ({
  status: 'needs_identifier',
  createdSessionId: null,
  isTransferable: false,
  ...overrides,
});

const signUpResource = (overrides: Record<string, unknown> = {}) => ({
  status: 'missing_requirements',
  createdSessionId: null,
  isTransferable: false,
  missingFields: [],
  unverifiedFields: [],
  unsafeMetadata: {},
  ...overrides,
});

const pushHandoffUrl = (search = '') => {
  window.history.pushState({}, '', `/handoff${search}`);
};

const getNavigatedUrl = (mock = mockCustomNavigate) => {
  const to = mock.mock.calls.at(-1)?.[0];
  return new URL(to, window.location.href);
};

const apiError = (code: string) => {
  return new ClerkAPIResponseError('Error', {
    data: [
      {
        code,
        message: 'Error',
        long_message: 'Error',
      },
    ],
    status: 400,
  });
};

describe('<Handoff />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClerkLoaded = true;
    mockUser = null;
    mockSession = null;
    mockSetActiveSession = { id: 'sess_active' };
    mockBuildAfterSignInUrl.mockReturnValue('/after-sign-in');
    mockBuildAfterSignUpUrl.mockReturnValue('/after-sign-up');
    mockBuildSignInUrl.mockReturnValue('/sign-in');
    mockBuildSignUpUrl.mockReturnValue('/sign-up');
    mockClerkNavigate.mockResolvedValue(undefined);
    mockCustomNavigate.mockResolvedValue(undefined);
    mockSetActive.mockImplementation(async ({ navigate }) => {
      await navigate({
        session: mockSetActiveSession,
        decorateUrl: (url: string) => `decorated:${url}`,
      });
    });
    mockSignInCreate.mockResolvedValue(signInResource({ status: 'needs_first_factor' }));
    mockSignUpCreate.mockResolvedValue(signUpResource());
    pushHandoffUrl();
  });

  it('renders only a clerk-captcha element with no visible UI', () => {
    mockClerkLoaded = false;

    const { container } = render(<Handoff />);

    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toBe(document.getElementById('clerk-captcha'));
    expect(container.textContent).toBe('');
  });

  it('waits for Clerk to load and runs once per mount', async () => {
    mockClerkLoaded = false;
    pushHandoffUrl('?__clerk_ticket=ticket_wait');

    const { rerender } = render(<Handoff />);

    expect(mockSignInCreate).not.toHaveBeenCalled();

    mockClerkLoaded = true;
    rerender(<Handoff />);

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledTimes(1);
    });

    rerender(<Handoff />);

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledTimes(1);
    });
  });

  it('redirects signed-in users without a ticket to the after-sign-in URL', async () => {
    mockUser = { id: 'user_123' };

    render(<Handoff />);

    await waitFor(() => {
      expect(mockClerkNavigate).toHaveBeenCalledWith('/after-sign-in');
    });
  });

  it('redirects signed-out users without a ticket to the sign-in URL', async () => {
    render(<Handoff />);

    await waitFor(() => {
      expect(mockClerkNavigate).toHaveBeenCalledWith(expect.stringContaining('/sign-in'));
    });
  });

  it('completes a sign-in ticket by removing handoff params and activating the created session', async () => {
    pushHandoffUrl('?__clerk_ticket=ticket_sign_in&__clerk_status=sign_in&kept=true');
    mockSignInCreate.mockResolvedValue(signInResource({ status: 'complete', createdSessionId: 'sess_sign_in' }));

    render(<Handoff />);

    await waitFor(() => {
      expect(mockSetActive).toHaveBeenCalledWith({
        session: 'sess_sign_in',
        navigate: expect.any(Function),
      });
    });

    expect(mockSignInCreate).toHaveBeenCalledWith({ strategy: 'ticket', ticket: 'ticket_sign_in' });
    expect(new URL(window.location.href).searchParams.get('__clerk_ticket')).toBeNull();
    expect(new URL(window.location.href).searchParams.get('__clerk_status')).toBeNull();
    expect(new URL(window.location.href).searchParams.get('kept')).toBe('true');
    expect(mockClerkNavigate).toHaveBeenCalledWith('decorated:/after-sign-in');
  });

  it('completes a sign-up ticket by removing handoff params and activating the created session', async () => {
    const unsafeMetadata = { plan: 'pro' };
    pushHandoffUrl('?__clerk_ticket=ticket_sign_up&__clerk_status=sign_up');
    mockSignUpCreate.mockResolvedValue(signUpResource({ status: 'complete', createdSessionId: 'sess_sign_up' }));

    render(<Handoff unsafeMetadata={unsafeMetadata} />);

    await waitFor(() => {
      expect(mockSetActive).toHaveBeenCalledWith({
        session: 'sess_sign_up',
        navigate: expect.any(Function),
      });
    });

    expect(mockSignUpCreate).toHaveBeenCalledWith({
      strategy: 'ticket',
      ticket: 'ticket_sign_up',
      unsafeMetadata,
    });
    expect(new URL(window.location.href).searchParams.get('__clerk_ticket')).toBeNull();
    expect(new URL(window.location.href).searchParams.get('__clerk_status')).toBeNull();
    expect(mockClerkNavigate).toHaveBeenCalledWith('decorated:/after-sign-up');
  });

  it.each([
    ['needs_first_factor', '/first-factor'],
    ['needs_client_trust', '/first-factor'],
    ['needs_second_factor', '/second-factor'],
    ['needs_new_password', '/reset-password'],
  ])('routes incomplete sign-in status %s to %s', async (status, expectedPath) => {
    pushHandoffUrl('?__clerk_ticket=ticket_incomplete&__clerk_status=sign_in');
    mockSignInCreate.mockResolvedValue(signInResource({ status }));

    render(
      <Handoff
        navigate={mockCustomNavigate}
        firstFactorUrl='/first-factor'
        secondFactorUrl='/second-factor'
        resetPasswordUrl='/reset-password'
      />,
    );

    await waitFor(() => {
      expect(mockCustomNavigate).toHaveBeenCalled();
    });

    const url = getNavigatedUrl();
    expect(url.pathname).toBe(expectedPath);
    expect(url.searchParams.get('__clerk_ticket')).toBe('ticket_incomplete');
    expect(url.searchParams.get('__clerk_status')).toBe('sign_in');
  });

  it('routes transferable sign-ins to sign-up unless transferable is false', async () => {
    pushHandoffUrl('?__clerk_ticket=ticket_transfer&__clerk_status=sign_in');
    mockSignInCreate.mockResolvedValue(signInResource({ isTransferable: true }));

    const { unmount } = render(
      <Handoff
        navigate={mockCustomNavigate}
        signUpUrl='/custom-sign-up'
      />,
    );

    await waitFor(() => {
      expect(getNavigatedUrl().pathname).toBe('/custom-sign-up');
    });

    unmount();
    vi.clearAllMocks();
    pushHandoffUrl('?__clerk_ticket=ticket_transfer&__clerk_status=sign_in');
    mockSignInCreate.mockResolvedValue(signInResource({ isTransferable: true }));

    render(
      <Handoff
        navigate={mockCustomNavigate}
        transferable={false}
        signInUrl='/custom-sign-in'
      />,
    );

    await waitFor(() => {
      expect(getNavigatedUrl().pathname).toBe('/custom-sign-in');
    });
  });

  it.each([
    [['email_address'], '/verify-email'],
    [['phone_number'], '/verify-phone'],
    [[], '/continue-sign-up'],
  ])('routes incomplete sign-up with unverified fields %j to %s', async (unverifiedFields, expectedPath) => {
    pushHandoffUrl('?__clerk_ticket=ticket_sign_up&__clerk_status=sign_up');
    mockSignUpCreate.mockResolvedValue(signUpResource({ unverifiedFields }));

    render(
      <Handoff
        navigate={mockCustomNavigate}
        verifyEmailAddressUrl='/verify-email'
        verifyPhoneNumberUrl='/verify-phone'
        continueSignUpUrl='/continue-sign-up'
      />,
    );

    await waitFor(() => {
      expect(mockCustomNavigate).toHaveBeenCalled();
    });

    const url = getNavigatedUrl();
    expect(url.pathname).toBe(expectedPath);
    expect(url.searchParams.get('__clerk_ticket')).toBe('ticket_sign_up');
    expect(url.searchParams.get('__clerk_status')).toBe('sign_up');
  });

  it('routes transferable sign-ups back to sign-in', async () => {
    pushHandoffUrl('?__clerk_ticket=ticket_sign_up&__clerk_status=sign_up');
    mockSignUpCreate.mockResolvedValue(signUpResource({ isTransferable: true }));

    render(
      <Handoff
        navigate={mockCustomNavigate}
        signInUrl='/custom-sign-in'
      />,
    );

    await waitFor(() => {
      expect(getNavigatedUrl().pathname).toBe('/custom-sign-in');
    });
  });

  it('calls onError and navigates to sign-in for errors without matching error message strings', async () => {
    const onError = vi.fn();
    const error = new Error("You're already signed in.");
    pushHandoffUrl('?__clerk_ticket=ticket_error&__clerk_status=sign_in');
    mockSignInCreate.mockRejectedValue(error);

    render(
      <Handoff
        navigate={mockCustomNavigate}
        onError={onError}
        signInUrl='/custom-sign-in'
      />,
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
      expect(getNavigatedUrl().pathname).toBe('/custom-sign-in');
    });

    expect(new URL(window.location.href).searchParams.get('__clerk_ticket')).toBe('ticket_error');
    expect(new URL(window.location.href).searchParams.get('__clerk_status')).toBe('sign_in');
  });

  it('removes handoff params for terminal ticket errors', async () => {
    const onError = vi.fn();
    const error = apiError('ticket_expired_code');
    pushHandoffUrl('?__clerk_ticket=ticket_error&__clerk_status=sign_in');
    mockSignInCreate.mockRejectedValue(error);

    render(
      <Handoff
        navigate={mockCustomNavigate}
        onError={onError}
        signInUrl='/custom-sign-in'
      />,
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
      expect(getNavigatedUrl().pathname).toBe('/custom-sign-in');
    });

    expect(new URL(window.location.href).searchParams.get('__clerk_ticket')).toBeNull();
    expect(new URL(window.location.href).searchParams.get('__clerk_status')).toBeNull();
  });
});
