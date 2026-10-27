import { ClerkAPIResponseError } from '@clerk/shared/error';
import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { clearFetchCache } from '../../../hooks';
import { UserVerificationFactorOne } from '../UserVerificationFactorOne';
import type { UserVerificationResetPassword } from '../utils';

type RenderedUserEvent = ReturnType<typeof render>['userEvent'];

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

  describe('Get Help', () => {
    it.todo('should render the get help component when clicking the "Get Help" button');
  });

  describe('Password pwned, reset by code', () => {
    const resetFactor = {
      strategy: 'reset_password_email_code',
      emailAddressId: 'idn_1',
      safeIdentifier: 'xxx@hello.com',
    } as const;

    const apiError = (code: string, paramName = 'password') =>
      new ClerkAPIResponseError('Error', {
        data: [{ code, message: code, long_message: code, meta: { param_name: paramName } }],
        status: 422,
      });

    const completeWithReset = {
      status: 'complete',
      session: { id: 'sess_1' },
      supportedFirstFactors: [],
      firstFactorVerification: { strategy: 'reset_password_email_code' },
    };

    // Starts the modal with password + email code + a reset factor, and submits a breached password.
    const submitPwnedPassword = async (
      opts: {
        resetPassword?: UserVerificationResetPassword;
        // The button on the breached screen, which depends on whether the caller has a new password.
        resetButtonText?: string;
      } = {},
    ) => {
      const afterVerification = vi.fn();
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withUser({ username: 'clerkuser' });
      });
      props.setProps({ afterVerification, resetPassword: opts.resetPassword } as any);
      fixtures.session?.startVerification.mockResolvedValue({
        status: 'needs_first_factor',
        supportedFirstFactors: [
          { strategy: 'password' },
          { strategy: 'email_code', emailAddressId: 'idn_1', safeIdentifier: 'xxx@hello.com' },
          resetFactor,
        ],
      });
      fixtures.session?.prepareFirstFactorVerification.mockResolvedValue({});
      fixtures.session?.attemptFirstFactorVerification.mockRejectedValueOnce(apiError('form_password_pwned'));

      const utils = render(<UserVerificationFactorOne />, { wrapper });
      await waitFor(() => utils.getByText('Verification required'));
      await utils.userEvent.type(utils.getByLabelText(/^password/i), 'breached');
      await utils.userEvent.click(utils.getByText('Continue'));
      await screen.findByText(opts.resetButtonText ?? 'Reset your password');
      return { ...utils, fixtures, afterVerification };
    };

    const setNewPassword = async (userEvent: RenderedUserEvent, password: string) => {
      await userEvent.type(screen.getByLabelText(/^new password/i), password);
      await userEvent.type(screen.getByLabelText(/^confirm password/i), password);
      await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    };

    // From the breached screen: reset, set a new password, and land on the code step.
    const reachResetCodeStep = async (userEvent: RenderedUserEvent) => {
      await userEvent.click(screen.getByText('Reset your password'));
      await setNewPassword(userEvent, 'a-much-better-password-123');
      await screen.findByText('Enter the code sent to your email address to set your new password');
    };

    it('offers the reset and the other methods after a breached password', async () => {
      await submitPwnedPassword();

      screen.getByText('Password compromised');
      screen.getByText('Or, verify with another method');
      screen.getByText('Email code to xxx@hello.com');
    });

    it('resets with a new password and a code, then reports the reset', async () => {
      const { userEvent, fixtures, afterVerification } = await submitPwnedPassword();
      fixtures.session?.attemptFirstFactorVerification.mockResolvedValueOnce(completeWithReset);

      await userEvent.click(screen.getByText('Reset your password'));
      // Sign out of other sessions is checked by default
      expect(screen.getByRole('checkbox', { name: /sign out of all other devices/i })).toBeChecked();
      await setNewPassword(userEvent, 'a-much-better-password-123');
      await screen.findByText('Enter the code sent to your email address to set your new password');
      await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');

      await waitFor(() => expect(afterVerification).toHaveBeenCalled());
      expect(fixtures.session?.prepareFirstFactorVerification).toHaveBeenCalledOnce();
      expect(fixtures.session?.prepareFirstFactorVerification).toHaveBeenCalledWith(resetFactor);
      expect(fixtures.session?.attemptFirstFactorVerification).toHaveBeenLastCalledWith({
        strategy: 'reset_password_email_code',
        code: '123456',
        password: 'a-much-better-password-123',
        signOutOfOtherSessions: true,
      });
      expect(fixtures.clerk.setActive).toHaveBeenCalled();
    });

    it('returns to the new password step when the new password is rejected, without resending the code', async () => {
      const { userEvent, fixtures } = await submitPwnedPassword();
      fixtures.session?.attemptFirstFactorVerification.mockRejectedValueOnce(
        apiError('form_new_password_matches_current'),
      );

      await reachResetCodeStep(userEvent);
      await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');

      await screen.findByText('Set new password');
      await setNewPassword(userEvent, 'another-better-password-456');
      await screen.findByText('Enter the code sent to your email address to set your new password');
      expect(fixtures.session?.prepareFirstFactorVerification).toHaveBeenCalledOnce();
    });

    it('stays on the code step when the code is wrong', async () => {
      const { userEvent, fixtures } = await submitPwnedPassword();
      fixtures.session?.attemptFirstFactorVerification.mockRejectedValueOnce(apiError('form_code_incorrect', 'code'));

      await reachResetCodeStep(userEvent);
      await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');

      await waitFor(() => expect(fixtures.session?.attemptFirstFactorVerification).toHaveBeenCalledTimes(2));
      screen.getByText('Enter the code sent to your email address to set your new password');
    });

    it('goes to the second factor when one is still required', async () => {
      const { userEvent, fixtures } = await submitPwnedPassword();
      fixtures.session?.attemptFirstFactorVerification.mockResolvedValueOnce({
        status: 'needs_second_factor',
        supportedFirstFactors: [],
      });

      await reachResetCodeStep(userEvent);
      await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');

      await waitFor(() => expect(fixtures.router.navigate).toHaveBeenCalledWith('./factor-two'));
    });

    it('skips the new password step when the caller already has one', async () => {
      const { userEvent, fixtures, afterVerification } = await submitPwnedPassword({
        resetPassword: { password: 'from-the-form-123', signOutOfOtherSessions: false },
        resetButtonText: 'Email code to xxx@hello.com',
      });
      fixtures.session?.attemptFirstFactorVerification.mockResolvedValueOnce(completeWithReset);

      // The copy is about saving the chosen password, not resetting it
      screen.getByText("Your current password was found in a data breach. Confirm it's you to save your new password.");
      expect(screen.queryByText('Reset your password')).not.toBeInTheDocument();
      expect(screen.queryByText(/please reset your password/i)).not.toBeInTheDocument();
      // The plain email code to the same address would be a duplicate button
      expect(screen.getAllByText('Email code to xxx@hello.com')).toHaveLength(1);

      await userEvent.click(screen.getByText('Email code to xxx@hello.com'));
      await screen.findByText('Check your email');
      screen.getByText('Enter the code sent to your email address to save your new password');
      await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');

      await waitFor(() => expect(afterVerification).toHaveBeenCalled());
      expect(fixtures.session?.attemptFirstFactorVerification).toHaveBeenLastCalledWith({
        strategy: 'reset_password_email_code',
        code: '123456',
        password: 'from-the-form-123',
        signOutOfOtherSessions: false,
      });
    });

    it('reports a new password picked in the modal after the caller password was rejected', async () => {
      const onPasswordChange = vi.fn();
      const { userEvent, fixtures, afterVerification } = await submitPwnedPassword({
        resetPassword: { password: 'from-the-form-123', signOutOfOtherSessions: false, onPasswordChange },
        resetButtonText: 'Email code to xxx@hello.com',
      });
      fixtures.session?.attemptFirstFactorVerification
        .mockRejectedValueOnce(apiError('form_password_pwned'))
        .mockResolvedValueOnce(completeWithReset);

      // The caller's password is rejected with the code
      await userEvent.click(screen.getByText('Email code to xxx@hello.com'));
      await screen.findByText('Check your email');
      await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
      await screen.findByText('Set new password');

      // The user picks another password in the modal
      await userEvent.clear(screen.getByLabelText(/^new password/i));
      await userEvent.clear(screen.getByLabelText(/^confirm password/i));
      await setNewPassword(userEvent, 'another-better-password-456');
      expect(onPasswordChange).toHaveBeenCalledWith('another-better-password-456');

      await screen.findByText('Enter the code sent to your email address to save your new password');
      await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
      await waitFor(() => expect(afterVerification).toHaveBeenCalled());
      expect(fixtures.session?.attemptFirstFactorVerification).toHaveBeenLastCalledWith({
        strategy: 'reset_password_email_code',
        code: '123456',
        password: 'another-better-password-456',
        signOutOfOtherSessions: false,
      });
    });

    it('goes back from the code step to the new password step, then to the breached screen, without old errors', async () => {
      const { userEvent, fixtures } = await submitPwnedPassword();
      fixtures.session?.prepareFirstFactorVerification.mockRejectedValueOnce(apiError('too_many_requests', ''));

      await userEvent.click(screen.getByText('Reset your password'));
      await setNewPassword(userEvent, 'a-much-better-password-123');
      await screen.findByText('too_many_requests');

      await userEvent.click(screen.getByRole('button', { name: 'Back' }));
      await screen.findByText('Set new password');
      await userEvent.click(screen.getByText('Back'));
      await screen.findByText('Reset your password');
      expect(screen.queryByText('too_many_requests')).not.toBeInTheDocument();
    });

    it("keeps the change password form's sign-out choice when its new password is rejected", async () => {
      const { userEvent, fixtures } = await submitPwnedPassword({
        resetPassword: { password: 'from-the-form-123', signOutOfOtherSessions: false },
        resetButtonText: 'Email code to xxx@hello.com',
      });
      fixtures.session?.attemptFirstFactorVerification.mockRejectedValueOnce(apiError('form_password_pwned'));

      await userEvent.click(screen.getByText('Email code to xxx@hello.com'));
      await screen.findByText('Check your email');
      await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');

      await screen.findByText('Set new password');
      expect(screen.queryByRole('checkbox', { name: /sign out of all other devices/i })).not.toBeInTheDocument();
    });

    it('offers the reset after a compromised password', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ username: 'clerkuser' });
      });
      fixtures.session?.startVerification.mockResolvedValue({
        status: 'needs_first_factor',
        supportedFirstFactors: [{ strategy: 'password' }, resetFactor],
      });
      fixtures.session?.attemptFirstFactorVerification.mockRejectedValueOnce(apiError('form_password_compromised'));

      const { userEvent, getByLabelText, getByText } = render(<UserVerificationFactorOne />, { wrapper });
      await waitFor(() => getByText('Verification required'));
      await userEvent.type(getByLabelText(/^password/i), 'compromised');
      await userEvent.click(getByText('Continue'));

      await screen.findByText('Reset your password');
      screen.getByText('Password compromised');
    });

    it('shows the error on the password card when no reset is offered', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ username: 'clerkuser' });
      });
      fixtures.session?.startVerification.mockResolvedValue({
        status: 'needs_first_factor',
        supportedFirstFactors: [{ strategy: 'password' }],
      });
      fixtures.session?.attemptFirstFactorVerification.mockRejectedValueOnce(apiError('form_password_pwned'));

      const { userEvent, getByLabelText, getByText } = render(<UserVerificationFactorOne />, { wrapper });
      await waitFor(() => getByText('Verification required'));
      await userEvent.type(getByLabelText(/^password/i), 'breached');
      await userEvent.click(getByText('Continue'));

      await waitFor(() => expect(fixtures.session?.attemptFirstFactorVerification).toHaveBeenCalledOnce());
      expect(screen.queryByText('Reset your password')).not.toBeInTheDocument();
      getByText('Verification required');
    });
  });
});
