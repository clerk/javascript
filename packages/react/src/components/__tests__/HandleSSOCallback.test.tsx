import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { HandleSSOCallback } from '../HandleSSOCallback';

const mockNavigateToApp = vi.fn();
const mockNavigateToSignIn = vi.fn();
const mockNavigateToSignUp = vi.fn();

const mockSignInFinalize = vi.fn().mockImplementation(async ({ navigate }) => {
  await navigate({ session: { id: 'sess_sign_in' }, decorateUrl: (url: string) => url });
  return { error: null };
});
const mockSignInCreate = vi.fn().mockResolvedValue({ error: null });
const mockSignUpFinalize = vi.fn().mockImplementation(async ({ navigate }) => {
  await navigate({ session: { id: 'sess_sign_up' }, decorateUrl: (url: string) => url });
  return { error: null };
});
const mockSignUpCreate = vi.fn().mockResolvedValue({ error: null });
const mockSetActive = vi.fn().mockImplementation(async ({ navigate }) => {
  await navigate({ session: { id: 'sess_existing' }, decorateUrl: (url: string) => url });
});

let mockClerkLoaded = true;
let mockSignIn: Record<string, unknown> = {};
let mockSignUp: Record<string, unknown> = {};

vi.mock('../../../src/hooks', () => ({
  useClerk: () => ({
    loaded: mockClerkLoaded,
    setActive: mockSetActive,
  }),
  useSignIn: () => ({
    signIn: {
      finalize: mockSignInFinalize,
      create: mockSignInCreate,
      get status() {
        return mockSignIn.status;
      },
      get isTransferable() {
        return mockSignIn.isTransferable;
      },
      get supportedFirstFactors() {
        return mockSignIn.supportedFirstFactors;
      },
      get existingSession() {
        return mockSignIn.existingSession;
      },
    },
  }),
  useSignUp: () => ({
    signUp: {
      finalize: mockSignUpFinalize,
      create: mockSignUpCreate,
      get status() {
        return mockSignUp.status;
      },
      get isTransferable() {
        return mockSignUp.isTransferable;
      },
      get existingSession() {
        return mockSignUp.existingSession;
      },
    },
  }),
}));

describe('<HandleSSOCallback />', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockClerkLoaded = true;
    mockSignIn = {};
    mockSignUp = {};
  });

  it('renders captcha element by default', () => {
    mockClerkLoaded = false;
    render(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
      />,
    );

    expect(document.getElementById('clerk-captcha')).not.toBeNull();
  });

  it('renders custom component when render prop is provided', async () => {
    mockClerkLoaded = false;
    render(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
        render={() => <div data-testid='custom-render'>Loading...</div>}
      />,
    );

    await screen.findByTestId('custom-render');
    await screen.findByText('Loading...');
  });

  it('does nothing when clerk is not loaded', async () => {
    mockClerkLoaded = false;
    render(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
      />,
    );

    await waitFor(() => {
      expect(mockSignInFinalize).not.toHaveBeenCalled();
      expect(mockSignUpFinalize).not.toHaveBeenCalled();
      expect(mockNavigateToApp).not.toHaveBeenCalled();
      expect(mockNavigateToSignIn).not.toHaveBeenCalled();
      expect(mockNavigateToSignUp).not.toHaveBeenCalled();
    });
  });

  it('finalizes sign-in and navigates to app when signIn.status is complete', async () => {
    mockSignIn = { status: 'complete' };

    render(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
      />,
    );

    await waitFor(() => {
      expect(mockSignInFinalize).toHaveBeenCalled();
      expect(mockNavigateToApp).toHaveBeenCalled();
    });
  });

  it('transfers sign-up to sign-in when signUp.isTransferable is true and sign-in completes', async () => {
    mockSignUp = { isTransferable: true };
    mockSignIn = { status: 'needs_identifier' };

    mockSignInCreate.mockImplementation(async () => {
      mockSignIn.status = 'complete';
      return { error: null };
    });

    render(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
      />,
    );

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({ transfer: true });
      expect(mockSignInFinalize).toHaveBeenCalled();
      expect(mockNavigateToApp).toHaveBeenCalled();
    });
  });

  it('navigates to sign-in when signUp.isTransferable is true but sign-in needs verification', async () => {
    mockSignUp = { isTransferable: true };
    mockSignIn = { status: 'needs_identifier' };

    mockSignInCreate.mockImplementation(async () => {
      mockSignIn.status = 'needs_first_factor';
      return { error: null };
    });

    render(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
      />,
    );

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({ transfer: true });
      expect(mockNavigateToSignIn).toHaveBeenCalled();
    });
  });

  it('navigates to sign-in when signIn.status is needs_first_factor with non-enterprise SSO factors', async () => {
    mockSignIn = {
      status: 'needs_first_factor',
      supportedFirstFactors: [{ strategy: 'password' }, { strategy: 'email_code' }],
    };

    render(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
      />,
    );

    await waitFor(() => {
      expect(mockNavigateToSignIn).toHaveBeenCalled();
    });
  });

  it('transfers sign-in to sign-up when signIn.isTransferable is true and sign-up completes', async () => {
    mockSignIn = { status: 'needs_identifier', isTransferable: true };
    mockSignUp = { status: 'missing_requirements' };

    mockSignUpCreate.mockImplementation(async () => {
      mockSignUp.status = 'complete';
      return { error: null };
    });

    render(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
      />,
    );

    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({ transfer: true });
      expect(mockSignUpFinalize).toHaveBeenCalled();
      expect(mockNavigateToApp).toHaveBeenCalled();
    });
  });

  it('navigates to sign-up when signIn.isTransferable is true but sign-up needs verification', async () => {
    mockSignIn = { status: 'needs_identifier', isTransferable: true };
    mockSignUp = { status: 'missing_requirements' };

    mockSignUpCreate.mockImplementation(async () => {
      mockSignUp.status = 'missing_requirements';
      return { error: null };
    });

    render(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
      />,
    );

    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({ transfer: true });
      expect(mockNavigateToSignUp).toHaveBeenCalled();
    });
  });

  it('finalizes sign-up and navigates to app when signUp.status is complete', async () => {
    mockSignIn = { status: 'needs_identifier', isTransferable: false };
    mockSignUp = { status: 'complete', isTransferable: false };

    render(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
      />,
    );

    await waitFor(() => {
      expect(mockSignUpFinalize).toHaveBeenCalled();
      expect(mockNavigateToApp).toHaveBeenCalled();
    });
  });

  it('navigates to sign-in when signIn.status is needs_second_factor', async () => {
    mockSignIn = { status: 'needs_second_factor', isTransferable: false };
    mockSignUp = { status: 'missing_requirements', isTransferable: false };

    render(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
      />,
    );

    await waitFor(() => {
      expect(mockNavigateToSignIn).toHaveBeenCalled();
    });
  });

  it('navigates to sign-in when signIn.status is needs_new_password', async () => {
    mockSignIn = { status: 'needs_new_password', isTransferable: false };
    mockSignUp = { status: 'missing_requirements', isTransferable: false };

    render(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
      />,
    );

    await waitFor(() => {
      expect(mockNavigateToSignIn).toHaveBeenCalled();
    });
  });

  it('activates existing session from signIn.existingSession and navigates to app', async () => {
    mockSignIn = {
      status: 'needs_identifier',
      isTransferable: false,
      existingSession: { sessionId: 'sess_existing_1' },
    };
    mockSignUp = { status: 'missing_requirements', isTransferable: false };

    render(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
      />,
    );

    await waitFor(() => {
      expect(mockSetActive).toHaveBeenCalledWith({
        session: 'sess_existing_1',
        navigate: expect.any(Function),
      });
      expect(mockNavigateToApp).toHaveBeenCalled();
    });
  });

  it('activates existing session from signUp.existingSession and navigates to app', async () => {
    mockSignIn = { status: 'needs_identifier', isTransferable: false };
    mockSignUp = {
      status: 'missing_requirements',
      isTransferable: false,
      existingSession: { sessionId: 'sess_existing_2' },
    };

    render(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
      />,
    );

    await waitFor(() => {
      expect(mockSetActive).toHaveBeenCalledWith({
        session: 'sess_existing_2',
        navigate: expect.any(Function),
      });
      expect(mockNavigateToApp).toHaveBeenCalled();
    });
  });

  it('does not run effect twice due to hasRun ref', async () => {
    mockSignIn = { status: 'complete' };

    const { rerender } = render(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
      />,
    );

    await waitFor(() => {
      expect(mockSignInFinalize).toHaveBeenCalledTimes(1);
    });

    rerender(
      <HandleSSOCallback
        navigateToApp={mockNavigateToApp}
        navigateToSignIn={mockNavigateToSignIn}
        navigateToSignUp={mockNavigateToSignUp}
      />,
    );

    await waitFor(() => {
      expect(mockSignInFinalize).toHaveBeenCalledTimes(1);
    });
  });
});
