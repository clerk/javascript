import { buildAccountsBaseUrl } from '@clerk/shared/buildAccountsBaseUrl';
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
    it('does not show use another method when password is the only first factor', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ username: 'clerkuser' });
      });
      fixtures.session?.startVerification.mockResolvedValue({
        status: 'needs_first_factor',
        supportedFirstFactors: [{ strategy: 'password' }],
      });

      const { findByText, queryByText } = render(<UserVerificationFactorOne />, { wrapper });

      await findByText('Verification required');
      expect(queryByText('Use another method')).toBeNull();
      await findByText('Get help');
    });

    it('does not show use another method when email is the only first factor', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ username: 'clerkuser' });
        f.withPreferredSignInStrategy({ strategy: 'otp' });
      });
      fixtures.session?.startVerification.mockResolvedValue({
        status: 'needs_first_factor',
        supportedFirstFactors: [
          {
            strategy: 'email_code',
            emailAddressId: 'email_1',
            safeIdentifier: 'xxx@hello.com',
          },
        ],
      });
      fixtures.session?.prepareFirstFactorVerification.mockResolvedValue({});

      const { findByText, queryByText } = render(<UserVerificationFactorOne />, { wrapper });

      await findByText('Verification required');
      expect(queryByText('Use another method')).toBeNull();
    });

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

  describe('Enterprise SSO', () => {
    const oktaFactor = { strategy: 'enterprise_sso', enterpriseConnectionId: 'ec_1', enterpriseConnectionName: 'Okta' };
    const entraFactor = {
      strategy: 'enterprise_sso',
      enterpriseConnectionId: 'ec_2',
      enterpriseConnectionName: 'Entra',
    };
    const redirectUrl = new URL('https://clerk.example.com/v1/verify?token=abc');

    it('renders a button for the connection when enterprise SSO is the only first factor', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ username: 'clerkuser' });
      });
      fixtures.session?.startVerification.mockResolvedValue({
        status: 'needs_first_factor',
        supportedFirstFactors: [oktaFactor],
      });

      const { findByText, findByRole, queryByText } = render(<UserVerificationFactorOne />, { wrapper });

      await findByText('Verification required');
      await findByRole('button', { name: /Okta/ });
      expect(queryByText('Use another method')).toBeNull();
    });

    it('renders one button per enterprise connection', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ username: 'clerkuser' });
      });
      fixtures.session?.startVerification.mockResolvedValue({
        status: 'needs_first_factor',
        supportedFirstFactors: [oktaFactor, entraFactor],
      });

      const { findByRole } = render(<UserVerificationFactorOne />, { wrapper });

      await findByRole('button', { name: /Okta/ });
      await findByRole('button', { name: /Entra/ });
    });

    it('lists enterprise SSO under use another method when password is the starting factor', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ username: 'clerkuser' });
      });
      fixtures.session?.startVerification.mockResolvedValue({
        status: 'needs_first_factor',
        supportedFirstFactors: [{ strategy: 'password' }, oktaFactor],
      });

      const { userEvent, findByText, findByRole, getByLabelText } = render(<UserVerificationFactorOne />, { wrapper });

      await findByText('Verification required');
      getByLabelText(/^password/i);

      await userEvent.click(await findByText('Use another method'));
      await userEvent.click(await findByText('Continue with Okta'));

      await findByText('Continue with your enterprise account to confirm it’s you');
      await findByRole('button', { name: /Okta/ });
    });

    it('redirects the page when the popup is blocked', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ username: 'clerkuser' });
      });
      fixtures.session?.startVerification.mockResolvedValue({
        status: 'needs_first_factor',
        supportedFirstFactors: [oktaFactor],
      });
      fixtures.session?.prepareFirstFactorVerification.mockResolvedValue({
        firstFactorVerification: { externalVerificationRedirectURL: redirectUrl },
      });
      vi.spyOn(window, 'open').mockReturnValue(null);

      const { userEvent, findByRole } = render(<UserVerificationFactorOne />, { wrapper });

      await userEvent.click(await findByRole('button', { name: /Okta/ }));

      await waitFor(() => {
        expect(fixtures.session?.prepareFirstFactorVerification).toHaveBeenCalledWith({
          strategy: 'enterprise_sso',
          enterpriseConnectionId: 'ec_1',
          redirectUrl: window.location.href,
          actionCompleteRedirectUrl: window.location.href,
        });
        expect(fixtures.clerk.navigate).toHaveBeenCalledWith(redirectUrl.href);
      });
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    });

    it('completes the verification once the popup reports back', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ username: 'clerkuser' });
      });
      fixtures.session?.startVerification.mockResolvedValue({
        status: 'needs_first_factor',
        supportedFirstFactors: [oktaFactor],
      });
      fixtures.session?.prepareFirstFactorVerification.mockResolvedValue({
        firstFactorVerification: { externalVerificationRedirectURL: redirectUrl },
      });
      const popup = { closed: false, location: { href: '' } };
      vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);

      const { userEvent, findByRole } = render(<UserVerificationFactorOne />, { wrapper });

      await userEvent.click(await findByRole('button', { name: /Okta/ }));

      await waitFor(() => expect(popup.location.href).toBe(redirectUrl.href));
      expect(fixtures.clerk.navigate).not.toHaveBeenCalled();

      window.dispatchEvent(
        new MessageEvent('message', {
          origin: buildAccountsBaseUrl(fixtures.clerk.frontendApi),
          data: { session: fixtures.session?.id },
        }),
      );

      await waitFor(() => expect(fixtures.clerk.setActive).toHaveBeenCalledWith({ session: fixtures.session?.id }));
    });
  });

  describe('Get Help', () => {
    it.todo('should render the get help component when clicking the "Get Help" button');
  });
});
