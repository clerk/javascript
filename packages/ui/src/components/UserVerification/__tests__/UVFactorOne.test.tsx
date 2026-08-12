import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { clearFetchCache } from '../../../hooks';
import { UserVerificationFactorOne } from '../UserVerificationFactorOne';

const { createFixtures } = bindCreateFixtures('UserVerification');

describe('UserVerificationFactorOne', () => {
  /**
   * `<UserVerificationFactorOne/>` internally uses useFetch which caches the results, be sure to clear the cache before each test
   */
  beforeEach(() => {
    clearFetchCache();
  });

  it('renders the component for with strategy:password', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ username: 'clerkuser' });
    });
    fixtures.session?.startVerification.mockResolvedValue({
      status: 'needs_first_factor',
      supportedFirstFactors: [{ strategy: 'password' }],
    });
    const { getByLabelText, getByText } = render(<UserVerificationFactorOne />, { wrapper });

    await waitFor(() => {
      getByText('Verification required');
      getByText('Enter your current password to continue');
      getByLabelText(/^password/i);
    });
  });

  it('renders the component for with strategy:email_code', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ username: 'clerkuser' });
      f.withPreferredSignInStrategy({ strategy: 'otp' });
    });
    fixtures.session?.startVerification.mockResolvedValue({
      status: 'needs_first_factor',
      supportedFirstFactors: [{ strategy: 'password' }, { strategy: 'email_code' }],
    });
    fixtures.session?.prepareFirstFactorVerification.mockResolvedValue({});
    const { getByLabelText, getByText } = render(<UserVerificationFactorOne />, { wrapper });

    await waitFor(() => {
      getByText('Verification required');
      getByLabelText(/Enter verification code/i);
    });

    expect(fixtures.session?.prepareFirstFactorVerification).toHaveBeenCalledOnce();
  });

  it('renders the component for with strategy:phone_code', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ username: 'clerkuser' });
      f.withPreferredSignInStrategy({ strategy: 'otp' });
    });
    fixtures.session?.startVerification.mockResolvedValue({
      status: 'needs_first_factor',
      supportedFirstFactors: [{ strategy: 'password' }, { strategy: 'phone_code' }],
    });
    fixtures.session?.prepareFirstFactorVerification.mockResolvedValue({});
    const { getByLabelText, getByText } = render(<UserVerificationFactorOne />, { wrapper });

    await waitFor(() => {
      getByText('Verification required');
      getByLabelText(/Enter verification code/i);
    });

    expect(fixtures.session?.prepareFirstFactorVerification).toHaveBeenCalledOnce();
  });

  it('prepares email-link reverification and preserves the protected action URL', async () => {
    window.history.replaceState({}, '', '/account/billing?return=plans');
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ username: 'clerkuser' });
    });
    const startEmailLinkFlow = vi.fn().mockResolvedValue({
      status: 'complete',
      session: { id: 'session_1' },
      firstFactorVerification: { status: 'verified' },
    });
    fixtures.session?.startVerification.mockResolvedValue({
      status: 'needs_first_factor',
      supportedFirstFactors: [
        {
          strategy: 'email_link',
          emailAddressId: 'idn_email',
          safeIdentifier: 'user@example.com',
        },
      ],
    });
    fixtures.session?.createEmailLinkFlow.mockReturnValue({
      startEmailLinkFlow,
      cancelEmailLinkFlow: vi.fn(),
    });

    const { getByText } = render(<UserVerificationFactorOne />, { wrapper });
    await waitFor(() => getByText('Check your email'));
    await waitFor(() => expect(startEmailLinkFlow).toHaveBeenCalledOnce());

    const redirectUrl = new URL(startEmailLinkFlow.mock.calls[0][0].redirectUrl);
    expect(redirectUrl.pathname).toBe('/account/billing');
    expect(redirectUrl.searchParams.get('return')).toBe('plans');
    const modalState = JSON.parse(atob(redirectUrl.searchParams.get('__clerk_modal_state')!));
    expect(modalState).toMatchObject({
      componentName: 'UserVerification',
      path: '/verify',
      startPath: '/user-verification',
    });
    await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledWith({ session: 'session_1' }));
  });

  describe('Submitting', () => {
    it('navigates to UserVerificationFactorTwo page when user submits first factor and second factor is enabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ username: 'clerkuser' });
      });
      fixtures.session?.startVerification.mockResolvedValue({
        status: 'needs_first_factor',
        supportedFirstFactors: [{ strategy: 'password' }],
      });
      fixtures.session?.attemptFirstFactorVerification.mockResolvedValue({
        status: 'needs_second_factor',
        supportedFirstFactors: [{ strategy: 'password' }],
      });
      fixtures.session?.prepareSecondFactorVerification.mockResolvedValue({
        status: 'needs_second_factor',
        supportedFirstFactors: [{ strategy: 'password' }],
      });

      const { userEvent, getByLabelText, getByText } = render(<UserVerificationFactorOne />, { wrapper });

      await waitFor(() => getByText('Verification required'));
      await userEvent.type(getByLabelText(/^password/i), 'testtest');
      await userEvent.click(getByText('Continue'));

      expect(fixtures.session?.attemptFirstFactorVerification).toHaveBeenCalledWith({
        strategy: 'password',
        password: 'testtest',
      });

      await waitFor(() => expect(fixtures.router.navigate).toHaveBeenCalledWith('./factor-two'));
    });

    it('sets an active session when user submits first factor successfully and second factor does not exist', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ username: 'clerkuser' });
      });
      fixtures.session?.startVerification.mockResolvedValue({
        status: 'needs_first_factor',
        supportedFirstFactors: [{ strategy: 'password' }],
      });
      fixtures.session?.attemptFirstFactorVerification.mockResolvedValue({
        status: 'complete',
        session: {
          id: '123',
        },
        supportedFirstFactors: [],
      });

      const { userEvent, getByLabelText, getByText } = render(<UserVerificationFactorOne />, { wrapper });

      await waitFor(() => getByText('Verification required'));
      await userEvent.type(getByLabelText(/^password/i), 'testtest');
      await userEvent.click(screen.getByText('Continue'));

      await waitFor(() => {
        expect(fixtures.clerk.setActive).toHaveBeenCalled();
      });
      expect(fixtures.session?.attemptFirstFactorVerification).toHaveBeenCalledTimes(1);
    });
  });

  describe('Use another method', () => {
    it('should list enabled first factor methods without the current one', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ username: 'clerkuser' });
      });
      fixtures.session?.startVerification.mockResolvedValue({
        status: 'needs_first_factor',
        supportedFirstFactors: [
          {
            strategy: 'email_code',
            emailAddressId: 'email_1',
            safeIdentifier: 'xxx@hello.com',
          },
          {
            strategy: 'email_code',
            emailAddressId: 'email_2',
            safeIdentifier: 'xxx+1@hello.com',
          },
        ],
      });
      fixtures.session?.prepareFirstFactorVerification.mockResolvedValue({});

      const { getByText, getByRole } = render(<UserVerificationFactorOne />, { wrapper });

      await waitFor(() => {
        getByText('Verification required');
        getByText('Use another method');
      });

      await waitFor(() => {
        getByText('Use another method').click();
        expect(getByRole('button')).toHaveTextContent('Email code to xxx+1@hello.com');
        expect(getByRole('button')).not.toHaveTextContent('Email code to xxx@hello.com');
      });
    });

    it('can select another method', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ username: 'clerkuser' });
      });
      fixtures.session?.startVerification.mockResolvedValue({
        status: 'needs_first_factor',
        supportedFirstFactors: [
          {
            strategy: 'email_code',
            emailAddressId: 'email_1',
            safeIdentifier: 'xxx@hello.com',
          },
          {
            strategy: 'email_code',
            emailAddressId: 'email_2',
            safeIdentifier: 'xxx+1@hello.com',
          },
        ],
      });
      fixtures.session?.prepareFirstFactorVerification.mockResolvedValue({});

      const { getByText, container } = render(<UserVerificationFactorOne />, { wrapper });

      await waitFor(() => {
        getByText('Verification required');
        expect(container).toHaveTextContent('xxx@hello.com');
        expect(container).not.toHaveTextContent('xxx+1@hello.com');
        getByText('Use another method');
      });

      await waitFor(() => {
        getByText('Use another method').click();
        getByText('Email code to xxx+1@hello.com').click();
      });

      await waitFor(() => {
        getByText('Verification required');
        expect(container).toHaveTextContent('xxx+1@hello.com');
      });
    });
  });

  describe('Get Help', () => {
    it.todo('should render the get help component when clicking the "Get Help" button');
  });
});
