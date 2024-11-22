import { describe, it } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { render, screen } from '../../../../testUtils';
import { clearFetchCache } from '../../../hooks';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
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
      getByText('Enter your password');
      getByText('Enter the password associated with your account');
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
      getByText('Check your email');
      getByLabelText(/Enter verification code/i);
    });

    expect(fixtures.session?.prepareFirstFactorVerification).toHaveBeenCalledTimes(1);
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
      getByText('Check your phone');
      getByLabelText(/Enter verification code/i);
    });

    expect(fixtures.session?.prepareFirstFactorVerification).toHaveBeenCalledTimes(1);
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

      await waitFor(() => getByText('Enter your password'));
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

      await waitFor(() => getByText('Enter your password'));
      await userEvent.type(getByLabelText(/^password/i), 'testtest');
      await userEvent.click(screen.getByText('Continue'));

      await waitFor(() => {
        expect(fixtures.clerk.setActive).toHaveBeenCalled();
      });
      expect(fixtures.session?.attemptFirstFactorVerification).toHaveBeenCalledTimes(1);
    });
  });

  describe('Use another method', () => {
    it.todo('should list enabled first factor methods without the current one');
  });

  describe('Get Help', () => {
    it.todo('should render the get help component when clicking the "Get Help" button');
  });
});
