import { ClerkAPIResponseError, parseError } from '@clerk/shared/error';
import type { SignInResource } from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, mockWebAuthn, render, screen } from '@/test/utils';

import { SignInFactorOne } from '../SignInFactorOne';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SignInFactorOne', () => {
  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withEmailAddress();
      f.withPassword();
      f.withPreferredSignInStrategy({ strategy: 'otp' });
      f.startSignInWithEmailAddress({ supportEmailCode: true });
    });
    fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
    render(<SignInFactorOne />, { wrapper });
    await screen.findByText('Check your email');
  });

  it('prefills the email if the identifier is an email', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress({ first_factors: ['email_code', 'email_link'] });
      f.withPassword();
      f.startSignInWithEmailAddress({ supportEmailCode: true, supportEmailLink: true, identifier: 'test@clerk.com' });
    });

    render(<SignInFactorOne />, { wrapper });
    await screen.findByText('test@clerk.com');
  });

  it('prefills the phone number if the identifier is a phone number', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withPhoneNumber();
      f.withPassword();
      f.startSignInWithPhoneNumber({ identifier: '+301234567890' });
    });

    render(<SignInFactorOne />, { wrapper });
    await screen.findByText('+30 123 4567890');
  });

  describe('Navigation', () => {
    it('navigates to SignInStart component when user clicks the edit icon', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.withPreferredSignInStrategy({ strategy: 'otp' });
        f.startSignInWithEmailAddress({ supportEmailCode: true });
      });
      fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      const { container, userEvent } = render(<SignInFactorOne />, { wrapper });
      container.getElementsByClassName('cl-identityPreviewEditButton');
      const editButton = container.getElementsByClassName('cl-identityPreviewEditButton').item(0);
      expect(editButton).toBeDefined();
      if (editButton) {
        await userEvent.click(editButton);
      }
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../');
    });

    it('navigates to SignInStart component if the user lands on SignInFactorOne directly without calling signIn.create', async () => {
      const { wrapper, fixtures } = await createFixtures();
      render(<SignInFactorOne />, { wrapper });
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../');
    });
  });

  describe('Submitting', () => {
    it('navigates to SignInFactorTwo page when user submits first factor and second factor is enabled', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withPhoneNumber();
        f.withPreferredSignInStrategy({ strategy: 'otp' });
        f.startSignInWithPhoneNumber({ supportPhoneCode: true, supportPassword: false });
      });
      fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      fixtures.signIn.attemptFirstFactor.mockReturnValueOnce(
        Promise.resolve({ status: 'needs_second_factor' } as SignInResource),
      );
      const { userEvent } = render(<SignInFactorOne />, { wrapper });

      await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
      await waitFor(() => {
        expect(fixtures.router.navigate).toHaveBeenCalledWith('../factor-two');
      });
    });

    it('sets an active session when user submits first factor successfully and second factor does not exist', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withPhoneNumber();
        f.withPreferredSignInStrategy({ strategy: 'otp' });
        f.startSignInWithPhoneNumber({ supportPhoneCode: true, supportPassword: false });
      });
      fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      fixtures.signIn.attemptFirstFactor.mockReturnValueOnce(Promise.resolve({ status: 'complete' } as SignInResource));
      const { userEvent } = render(<SignInFactorOne />, { wrapper });

      await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
      await waitFor(() => {
        expect(fixtures.clerk.setActive).toHaveBeenCalled();
      });
    });
  });

  describe('Selected First Factor Method', () => {
    describe('Password', () => {
      it('shows an input to fill with password', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithEmailAddress({ supportEmailCode: true, supportPassword: true });
        });
        render(<SignInFactorOne />, { wrapper });
        await screen.findByText('Password');
      });

      it('should render the other methods component when clicking on "Forgot password"', async () => {
        const email = 'test@clerk.com';
        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithEmailAddress({
            supportEmailCode: true,
            supportPassword: true,
            supportResetPassword: false,
            identifier: email,
          });
        });
        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.click(screen.getByText(/Forgot password/i));
        await screen.findByText('Use another method');
        expect(screen.queryByText('Or, sign in with another method')).not.toBeInTheDocument();
        await screen.findByText(`Email code to ${email}`);
        expect(screen.queryByText('Sign in with your password')).not.toBeInTheDocument();
      });

      it('should render the Forgot Password alternative methods component when clicking on "Forgot password" (email)', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithEmailAddress({
            supportEmailCode: true,
            supportPassword: true,
            supportResetPassword: true,
          });
        });
        const { userEvent } = render(<SignInFactorOne />, { wrapper });

        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        await userEvent.click(screen.getByText(/Forgot password/i));
        await screen.findByText('Forgot Password?');
        await screen.findByText('Or, sign in with another method');
        await userEvent.click(screen.getByText('Reset your password'));
        await screen.findByText('First, enter the code sent to your email address');
      });

      it('shows a UI error when submission fails', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithPhoneNumber({ supportPassword: true });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.attemptFirstFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [
              {
                code: 'form_code_incorrect',
                long_message: 'Incorrect Password',
                message: 'is incorrect',
                meta: { param_name: 'password' },
              },
            ],
            status: 422,
          }),
        );
        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText('Password'), '123456');
        await userEvent.click(screen.getByText('Continue'));
        const errorElement = await screen.findByTestId('form-feedback-error');
        expect(errorElement).toHaveTextContent(/Incorrect Password/i);
      });

      it('redirects back to sign-in if the user is locked', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithPhoneNumber({ supportPassword: true });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

        const errJSON = {
          code: 'user_locked',
          long_message: 'Your account is locked. Please try again after 1 hour.',
          message: 'Account locked',
          meta: { duration_in_seconds: 3600 },
        };

        fixtures.signIn.attemptFirstFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [errJSON],
            status: 422,
          }),
        );
        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText('Password'), '123456');
        await userEvent.click(screen.getByText('Continue'));
        expect(fixtures.clerk.__internal_navigateWithError).toHaveBeenCalledWith('..', parseError(errJSON));
      });

      it('Prompts the user to reset their password via email if it has been pwned', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithEmailAddress({
            supportPassword: true,
            supportEmailCode: true,
            supportResetPassword: true,
          });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

        const errJSON = {
          code: 'form_password_pwned',
          long_message:
            'Password has been found in an online data breach. For account safety, please reset your password.',
          message: 'Password has been found in an online data breach. For account safety, please reset your password.',
          meta: { param_name: 'password' },
        };

        fixtures.signIn.attemptFirstFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [errJSON],
            status: 422,
          }),
        );

        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText('Password'), '123456');
        await userEvent.click(screen.getByText('Continue'));

        await screen.findByText('Password compromised');
        await screen.findByText(
          'This password has been found as part of a breach and can not be used, please reset your password.',
        );
        await screen.findByText('Or, sign in with another method');

        await userEvent.click(screen.getByText('Reset your password'));
        await screen.findByText('First, enter the code sent to your email address');
      });

      it('Prompts the user to reset their password via phone if it has been pwned', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithPhoneNumber({
            supportPassword: true,
            supportPhoneCode: true,
            supportResetPassword: true,
          });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

        const errJSON = {
          code: 'form_password_pwned',
          long_message:
            'Password has been found in an online data breach. For account safety, please reset your password.',
          message: 'Password has been found in an online data breach. For account safety, please reset your password.',
          meta: { param_name: 'password' },
        };

        fixtures.signIn.attemptFirstFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [errJSON],
            status: 422,
          }),
        );

        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText('Password'), '123456');
        await userEvent.click(screen.getByText('Continue'));

        await screen.findByText('Password compromised');
        await screen.findByText(
          'This password has been found as part of a breach and can not be used, please reset your password.',
        );
        await screen.findByText('Or, sign in with another method');

        await userEvent.click(screen.getByText('Reset your password'));
        await screen.findByText('First, enter the code sent to your phone');
      });

      it('entering a pwned password, then going back and clicking forgot password should result in the correct title', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithEmailAddress({
            supportPassword: true,
            supportEmailCode: true,
            supportResetPassword: true,
          });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

        const errJSON = {
          code: 'form_password_pwned',
          long_message:
            'Password has been found in an online data breach. For account safety, please reset your password.',
          message: 'Password has been found in an online data breach. For account safety, please reset your password.',
          meta: { param_name: 'password' },
        };

        fixtures.signIn.attemptFirstFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [errJSON],
            status: 422,
          }),
        );

        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText('Password'), '123456');
        await userEvent.click(screen.getByText('Continue'));

        await screen.findByText('Password compromised');
        await screen.findByText(
          'This password has been found as part of a breach and can not be used, please reset your password.',
        );
        await screen.findByText('Or, sign in with another method');

        // Go back
        await userEvent.click(screen.getByText('Back'));

        // Choose to reset password via "Forgot password" instead
        await userEvent.click(screen.getByText(/Forgot password/i));
        await screen.findByText('Forgot Password?');
        expect(
          screen.queryByText(
            'This password has been found as part of a breach and can not be used, please reset your password.',
          ),
        ).not.toBeInTheDocument();
      });

      it('Prompts the user to reset their password via email if it is too long', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithEmailAddress({
            supportPassword: true,
            supportEmailCode: true,
            supportResetPassword: true,
          });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

        const errJSON = {
          code: 'password_too_long_needs_reset',
          long_message: 'The existing imported password is too long and cannot be used, please reset your password.',
          message: 'The existing imported password is too long and cannot be used, please reset your password.',
          meta: { param_name: 'password' },
        };

        fixtures.signIn.attemptFirstFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [errJSON],
            status: 422,
          }),
        );

        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText('Password'), '123456');
        await userEvent.click(screen.getByText('Continue'));

        await screen.findByText('Password too long');
        await screen.findByText(
          'The existing imported password is too long and cannot be used, please reset your password.',
        );
        await screen.findByText('Or, sign in with another method');

        await userEvent.click(screen.getByText('Reset your password'));
        await screen.findByText('First, enter the code sent to your email address');
      });

      it('Prompts the user to reset their password via phone if it is too long', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithPhoneNumber({
            supportPassword: true,
            supportPhoneCode: true,
            supportResetPassword: true,
          });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

        const errJSON = {
          code: 'password_too_long_needs_reset',
          long_message: 'The existing imported password is too long and cannot be used, please reset your password.',
          message: 'The existing imported password is too long and cannot be used, please reset your password.',
          meta: { param_name: 'password' },
        };

        fixtures.signIn.attemptFirstFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [errJSON],
            status: 422,
          }),
        );

        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText('Password'), '123456');
        await userEvent.click(screen.getByText('Continue'));

        await screen.findByText('Password too long');
        await screen.findByText(
          'The existing imported password is too long and cannot be used, please reset your password.',
        );
        await screen.findByText('Or, sign in with another method');

        await userEvent.click(screen.getByText('Reset your password'));
        await screen.findByText('First, enter the code sent to your phone');
      });

      it('entering a password that is too long, then going back and clicking forgot password should result in the correct title', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithEmailAddress({
            supportPassword: true,
            supportEmailCode: true,
            supportResetPassword: true,
          });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

        const errJSON = {
          code: 'password_too_long_needs_reset',
          long_message: 'The existing imported password is too long and cannot be used, please reset your password.',
          message: 'The existing imported password is too long and cannot be used, please reset your password.',
          meta: { param_name: 'password' },
        };

        fixtures.signIn.attemptFirstFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [errJSON],
            status: 422,
          }),
        );

        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText('Password'), '123456');
        await userEvent.click(screen.getByText('Continue'));

        await screen.findByText('Password too long');
        await screen.findByText(
          'The existing imported password is too long and cannot be used, please reset your password.',
        );
        await screen.findByText('Or, sign in with another method');

        // Go back
        await userEvent.click(screen.getByText('Back'));

        // Choose to reset password via "Forgot password" instead
        await userEvent.click(screen.getByText(/Forgot password/i));
        await screen.findByText('Forgot Password?');
        expect(
          screen.queryByText(
            'The existing imported password is too long and cannot be used, please reset your password.',
          ),
        ).not.toBeInTheDocument();
      });

      it('using an compromised password should show the compromised password screen', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithEmailAddress({
            supportEmailCode: true,
            supportPassword: true,
            supportResetPassword: true,
          });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

        const errJSON = {
          code: 'form_password_compromised',
          long_message:
            'Your password may be compromised. To protect your account, please continue with an alternative sign-in method. You will be required to reset your password after signing in.',
          message:
            'Your password may be compromised. To protect your account, please continue with an alternative sign-in method. You will be required to reset your password after signing in.',
          meta: { param_name: 'password' },
        };

        fixtures.signIn.attemptFirstFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [errJSON],
            status: 422,
          }),
        );
        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText('Password'), '123456');
        await userEvent.click(screen.getByText('Continue'));

        await screen.findByText('Password compromised');
        await screen.findByText(
          'Your password may be compromised. To protect your account, please continue with an alternative sign-in method. You will be required to reset your password after signing in.',
        );

        await screen.findByText('Email code to hello@clerk.com');
      });

      it('Prompts the user to use a different method if the password is compromised', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.withSocialProvider({ provider: 'google', authenticatable: true });
          f.startSignInWithEmailAddress({
            supportEmailCode: true,
            supportPassword: true,
            supportResetPassword: true,
          });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

        const errJSON = {
          code: 'form_password_compromised',
          long_message:
            'Your password may be compromised. To protect your account, please continue with an alternative sign-in method. You will be required to reset your password after signing in.',
          message:
            'Your password may be compromised. To protect your account, please continue with an alternative sign-in method. You will be required to reset your password after signing in.',
          meta: { param_name: 'password' },
        };

        fixtures.signIn.attemptFirstFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [errJSON],
            status: 422,
          }),
        );
        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText('Password'), '123456');
        await userEvent.click(screen.getByText('Continue'));

        await screen.findByText('Password compromised');
        await userEvent.click(screen.getByText('Email code to hello@clerk.com'));
        await screen.findByText('Check your email');
      });
    });

    describe('Forgot Password', () => {
      it('shows an input to add the code sent to phone', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithPhoneNumber({
            supportPassword: true,
            supportResetPassword: true,
          });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.click(screen.getByText(/Forgot password/i));
        await screen.findByText('Forgot Password?');

        await userEvent.click(screen.getByText('Reset your password'));
        await screen.findByText('First, enter the code sent to your phone');
      });

      it('redirects to `reset-password` on successful code verification', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithEmailAddress({
            supportEmailCode: true,
            supportPassword: true,
            supportResetPassword: true,
          });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.attemptFirstFactor.mockReturnValueOnce(
          Promise.resolve({ status: 'needs_new_password' } as SignInResource),
        );
        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.click(screen.getByText(/Forgot password/i));
        await userEvent.click(screen.getByText('Reset your password'));
        await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
        expect(fixtures.signIn.attemptFirstFactor).toHaveBeenCalledWith({
          strategy: 'reset_password_email_code',
          code: '123456',
        });
        await waitFor(() => {
          expect(fixtures.router.navigate).toHaveBeenCalledWith('../reset-password');
        });
      });

      it('redirects to `reset-password` on successful code verification received in phone number', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'password' });
          f.startSignInWithPhoneNumber({
            supportPassword: true,
            supportResetPassword: true,
          });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.attemptFirstFactor.mockReturnValueOnce(
          Promise.resolve({ status: 'needs_new_password' } as SignInResource),
        );
        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.click(screen.getByText(/Forgot password/i));
        await userEvent.click(screen.getByText('Reset your password'));
        await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
        expect(fixtures.signIn.attemptFirstFactor).toHaveBeenCalledWith({
          strategy: 'reset_password_phone_code',
          code: '123456',
        });
        await waitFor(() => {
          expect(fixtures.router.navigate).toHaveBeenCalledWith('../reset-password');
        });
      });
    });

    describe('Verification link', () => {
      it('shows message to use the magic link in their email', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withEmailLink();
          f.startSignInWithEmailAddress({ supportEmailLink: true, supportPassword: false });
        });

        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.createEmailLinkFlow.mockImplementation(
          () =>
            ({
              startEmailLinkFlow: vi.fn(() => new Promise(() => ({}))),
              cancelEmailLinkFlow: vi.fn(() => new Promise(() => ({}))),
            }) as any,
        );

        render(<SignInFactorOne />, { wrapper });
        await screen.findByText('Use the verification link sent to your email');
      });

      it('enables the "Resend link" button after 60 seconds', async () => {
        vi.useFakeTimers();

        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withEmailLink();
          f.startSignInWithEmailAddress({ supportEmailLink: true, supportPassword: false });
        });

        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.createEmailLinkFlow.mockImplementation(
          () =>
            ({
              startEmailLinkFlow: vi.fn(() => new Promise(() => ({}))),
              cancelEmailLinkFlow: vi.fn(() => new Promise(() => ({}))),
            }) as any,
        );

        const { getByText } = render(<SignInFactorOne />, { wrapper });
        expect(getByText(/Resend/, { exact: false }).closest('button')).toHaveAttribute('disabled');
        await act(() => {
          vi.advanceTimersByTime(30000);
        });
        expect(getByText(/Resend/, { exact: false }).closest('button')).toHaveAttribute('disabled');
        await act(() => {
          vi.advanceTimersByTime(30000);
        });
        expect(getByText(/Resend/, { exact: false }).closest('button')).not.toHaveAttribute('disabled');

        vi.useRealTimers();
      });
    });

    describe('Email Code', () => {
      it('shows an input to add the code sent to email', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithEmailAddress({ supportEmailCode: true });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        render(<SignInFactorOne />, { wrapper });
        await screen.findByText('Check your email');
      });

      it('enables the "Resend code" button after 30 seconds', async () => {
        vi.useFakeTimers();

        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithEmailAddress({ supportEmailCode: true });
        });

        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        const { getByText } = render(<SignInFactorOne />, { wrapper });
        expect(getByText(/Resend/, { exact: false }).closest('button')).toHaveAttribute('disabled');
        await act(() => {
          vi.advanceTimersByTime(15000);
        });
        expect(getByText(/Resend/, { exact: false }).closest('button')).toHaveAttribute('disabled');
        await act(() => {
          vi.advanceTimersByTime(15000);
        });
        expect(getByText(/Resend/, { exact: false }).closest('button')).not.toHaveAttribute('disabled');

        vi.useRealTimers();
      });

      it('auto submits when typing all the 6 digits of the code', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true, supportPassword: false });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.attemptFirstFactor.mockReturnValueOnce(
          Promise.resolve({ status: 'complete' } as SignInResource),
        );
        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
        expect(fixtures.signIn.attemptFirstFactor).toHaveBeenCalled();
      });

      it('shows a UI error when submission fails', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true, supportPassword: false });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.attemptFirstFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [
              {
                code: 'form_code_incorrect',
                long_message: 'Incorrect code',
                message: 'is incorrect',
                meta: { param_name: 'code' },
              },
            ],
            status: 422,
          }),
        );
        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
        const errorElement = await screen.findByTestId('form-feedback-error');
        expect(errorElement).toHaveTextContent(/Incorrect code/i);
      });

      it('redirects back to sign-in if the user is locked', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true, supportPassword: false });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

        const errJSON = {
          code: 'user_locked',
          long_message: 'Your account is locked. Please try again after 2 hours.',
          message: 'Account locked',
          meta: { duration_in_seconds: 7200 },
        };

        fixtures.signIn.attemptFirstFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [errJSON],
            status: 422,
          }),
        );

        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
        expect(fixtures.clerk.__internal_navigateWithError).toHaveBeenCalledWith('..', parseError(errJSON));
      });
    });

    describe('Phone Code', () => {
      it('shows an input to add the code sent to phone', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withPhoneNumber();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true, supportPassword: false });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        render(<SignInFactorOne />, { wrapper });
        await screen.findByText('Check your phone');
        await screen.findByText('to continue to TestApp');
      });

      it('enables the "Resend" button after 30 seconds', async () => {
        vi.useFakeTimers();

        const { wrapper, fixtures } = await createFixtures(f => {
          f.withPhoneNumber();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true, supportPassword: false });
        });

        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        const { getByText } = render(<SignInFactorOne />, { wrapper });
        expect(getByText(/Resend/, { exact: false }).closest('button')).toHaveAttribute('disabled');
        await act(() => {
          vi.advanceTimersByTime(15000);
        });
        expect(getByText(/Resend/, { exact: false }).closest('button')).toHaveAttribute('disabled');
        await act(() => {
          vi.advanceTimersByTime(15000);
        });
        expect(getByText(/Resend/, { exact: false }).closest('button')).not.toHaveAttribute('disabled');

        vi.useRealTimers();
      });

      it('auto submits when typing all the 6 digits of the code', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withPhoneNumber();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true, supportPassword: false });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.attemptFirstFactor.mockReturnValueOnce(
          Promise.resolve({ status: 'complete' } as SignInResource),
        );
        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
        expect(fixtures.signIn.attemptFirstFactor).toHaveBeenCalled();
      });

      it('shows a UI error when submission fails', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withPhoneNumber();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true, supportPassword: false });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.attemptFirstFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [
              {
                code: 'form_code_incorrect',
                long_message: 'Incorrect phone code',
                message: 'is incorrect',
                meta: { param_name: 'code' },
              },
            ],
            status: 422,
          }),
        );
        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
        const errorElement = await screen.findByTestId('form-feedback-error');
        expect(errorElement).toHaveTextContent(/Incorrect phone code/i);
      });

      it('redirects back to sign-in if the user is locked', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withPhoneNumber();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true, supportPassword: false });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

        const errJSON = {
          code: 'user_locked',
          long_message: 'Your account is locked. Please contact support for more information.',
          message: 'Account locked',
        };

        fixtures.signIn.attemptFirstFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [errJSON],
            status: 422,
          }),
        );

        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
        expect(fixtures.clerk.__internal_navigateWithError).toHaveBeenCalledWith('..', parseError(errJSON));
      });
    });

    describe('Passkey', () => {
      it('shows the next available factor because webauthn is not supported', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPasskey();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithEmailAddress({ supportPasskey: true, supportEmailCode: true });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        render(<SignInFactorOne />, { wrapper });
        await screen.findByText('Check your email');
      });

      mockWebAuthn(() => {
        it('shows a passkey factor one screen', async () => {
          const { wrapper } = await createFixtures(f => {
            f.withEmailAddress();
            f.withPassword();
            f.withPasskey();
            f.withPreferredSignInStrategy({ strategy: 'otp' });
            f.startSignInWithEmailAddress({ supportPasskey: true, supportEmailCode: true });
          });
          render(<SignInFactorOne />, { wrapper });
          await screen.findByText('Use your passkey');
          await screen.findByText(
            "Using your passkey confirms it's you. Your device may ask for your fingerprint, face or screen lock.",
          );
          await screen.findByText('hello@clerk.com');
        });

        it('call appropriate method from passkey factor one screen', async () => {
          const { wrapper, fixtures } = await createFixtures(f => {
            f.withEmailAddress();
            f.withPassword();
            f.withPasskey();
            f.withPreferredSignInStrategy({ strategy: 'otp' });
            f.startSignInWithEmailAddress({ supportPasskey: true, supportEmailCode: true });
          });
          fixtures.signIn.authenticateWithPasskey.mockResolvedValue({
            status: 'complete',
          } as SignInResource);
          const { userEvent } = render(<SignInFactorOne />, { wrapper });

          await userEvent.click(screen.getByText('Continue'));

          expect(fixtures.signIn.authenticateWithPasskey).toHaveBeenCalled();
        });
      });
    });
  });

  describe('Use another method', () => {
    it('should render the other authentication methods list component when clicking on "Use another method"', async () => {
      const email = 'test@clerk.com';
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress({ first_factors: ['email_code', 'email_link'] });
        f.withPassword();
        f.startSignInWithEmailAddress({ supportEmailCode: true, supportEmailLink: true, identifier: email });
      });

      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      await screen.findByText(`Email code to ${email}`);
      await screen.findByText(`Email link to ${email}`);
      expect(screen.queryByText(`Sign in with your password`)).not.toBeInTheDocument();
    });

    it('"Use another method" should not exist if only the current strategy is available', async () => {
      const email = 'test@clerk.com';
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress({ first_factors: [], verifications: [] });
        f.withPassword();
        f.startSignInWithEmailAddress({
          supportEmailCode: false,
          supportEmailLink: false,
          identifier: email,
          supportPassword: true,
        });
      });

      render(<SignInFactorOne />, { wrapper });
      expect(screen.queryByText(`Use another method`)).not.toBeInTheDocument();
      await screen.findByText(`Get help`);
    });

    it('should go back to the main screen when clicking the "<- Back" button from the "Use another method" page', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.withPreferredSignInStrategy({ strategy: 'password' });
        f.startSignInWithEmailAddress({ supportEmailCode: true });
      });

      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      await userEvent.click(screen.getByText('Back'));
      await screen.findByText('Enter your password');
    });

    it('should list all the enabled first factor methods', async () => {
      const email = 'test@clerk.com';
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.withPreferredSignInStrategy({ strategy: 'otp' });
        f.startSignInWithEmailAddress({ supportEmailCode: true, identifier: email });
      });
      fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      await screen.findByText(`Sign in with your password`);
      const deactivatedMethod = screen.queryByText(`Send link to ${email}`);
      expect(deactivatedMethod).not.toBeInTheDocument();
    });

    it('should skip passkey alternative method when webauthn is not supported', async () => {
      const email = 'test@clerk.com';
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.withPasskey();
        f.withPreferredSignInStrategy({ strategy: 'otp' });
        f.startSignInWithEmailAddress({ supportPasskey: true, supportEmailCode: true, identifier: email });
      });
      fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      await userEvent.click(screen.getByText('Sign in with your password'));
      await userEvent.click(screen.getByText('Use another method'));
      const deactivatedMethod = screen.queryByText(`Sign in with your passkey`);
      expect(deactivatedMethod).not.toBeInTheDocument();
    });

    mockWebAuthn(() => {
      it('should not skip passkey alternative method when webauthn is supported', async () => {
        const email = 'test@clerk.com';
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPasskey();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithEmailAddress({ supportPasskey: true, supportEmailCode: true, identifier: email });
        });
        fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.click(screen.getByText('Use another method'));
        await userEvent.click(screen.getByText('Sign in with your password'));
        await userEvent.click(screen.getByText('Use another method'));
        await screen.findByText(`Sign in with your passkey`);
      });
    });

    it('should list enabled first factor methods without the current one', async () => {
      const email = 'test@clerk.com';
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withSocialProvider({ provider: 'google' });
        f.withEmailAddress();
        f.withPassword();
        f.withPreferredSignInStrategy({ strategy: 'otp' });
        f.startSignInWithEmailAddress({ supportEmailCode: true, identifier: email });
      });
      fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      const currentMethod = screen.queryByText(`Send code to ${email}`);
      expect(currentMethod).not.toBeInTheDocument();
      await screen.findByText(/Continue with google/i);
      await screen.findByText(`Sign in with your password`);
      const deactivatedMethod = screen.queryByText(`Send link to ${email}`);
      expect(deactivatedMethod).not.toBeInTheDocument();
    });

    it('clicking the password method should show the password input', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.withPreferredSignInStrategy({ strategy: 'otp' });
        f.startSignInWithEmailAddress({ supportEmailCode: true });
      });
      fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      await userEvent.click(screen.getByText('Sign in with your password'));
      await screen.findByText('Enter your password');
    });

    it('clicking the email link method should show the magic link screen', async () => {
      const email = 'test@clerk.com';
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.withPreferredSignInStrategy({ strategy: 'password' });
        f.startSignInWithEmailAddress({ supportEmailLink: true, identifier: email });
      });
      fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      fixtures.signIn.createEmailLinkFlow.mockImplementation(
        () =>
          ({
            startEmailLinkFlow: vi.fn(() => new Promise(() => ({}))),
            cancelEmailLinkFlow: vi.fn(() => new Promise(() => ({}))),
          }) as any,
      );
      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      await screen.findByText(`Email link to ${email}`);
      await userEvent.click(screen.getByText(`Email link to ${email}`));
      await screen.findByText('Check your email');
      await screen.findByText('Use the verification link sent to your email');
    });

    it('clicking the email code method should show the email code input', async () => {
      const email = 'test@clerk.com';
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.withPreferredSignInStrategy({ strategy: 'password' });
        f.startSignInWithEmailAddress({ supportEmailCode: true, identifier: email });
      });
      fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      fixtures.signIn.createEmailLinkFlow.mockReturnValue({
        startEmailLinkFlow: vi.fn(() => new Promise(() => ({}))),
        cancelEmailLinkFlow: vi.fn(() => new Promise(() => ({}))),
      } as any);
      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      await screen.findByText(`Email code to ${email}`);
      await userEvent.click(screen.getByText(`Email code to ${email}`));
      await screen.findByText('Check your email');
      await screen.findByText('to continue to TestApp');
    });

    it('clicking the phone code method should show the phone code input', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.withPreferredSignInStrategy({ strategy: 'password' });
        f.startSignInWithPhoneNumber({ supportPhoneCode: true });
      });
      fixtures.signIn.prepareFirstFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      fixtures.signIn.createEmailLinkFlow.mockReturnValue({
        startEmailLinkFlow: vi.fn(() => new Promise(() => ({}))),
        cancelEmailLinkFlow: vi.fn(() => new Promise(() => ({}))),
      } as any);
      const { userEvent } = render(<SignInFactorOne />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      await screen.findByText(/code to \+/);
      await userEvent.click(screen.getByText(/code to \+/));
      await screen.findByText('Check your phone');
    });

    describe('Get Help', () => {
      it('should render the get help component when clicking the "Get Help" button', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress({ first_factors: ['email_code', 'email_link'] });
          f.startSignInWithEmailAddress({ supportEmailCode: true, supportEmailLink: true });
        });

        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.click(screen.getByText('Use another method'));
        await userEvent.click(screen.getByText('Get help'));
        await screen.findByText('Email support');
      });

      it('should go back to "Use another method" screen when clicking the "<- Back" button', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress({ first_factors: ['email_code', 'email_link'] });
          f.startSignInWithEmailAddress({ supportEmailCode: true, supportEmailLink: true });
        });

        const { userEvent, getByText } = render(<SignInFactorOne />, { wrapper });
        await userEvent.click(getByText('Use another method'));
        await userEvent.click(getByText('Get help'));
        await userEvent.click(getByText('Back'));

        expect(getByText('Use another method'));
      });

      it('should open a "mailto:" link when clicking the email support button', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress({ first_factors: ['email_code', 'email_link'] });
          f.startSignInWithEmailAddress({ supportEmailCode: true, supportEmailLink: true });
        });

        const { userEvent } = render(<SignInFactorOne />, { wrapper });
        await userEvent.click(screen.getByText('Use another method'));
        await userEvent.click(screen.getByText('Get help'));

        const assignMock = vi.fn();
        const mockResponse = vi.fn();
        Object.defineProperty(window, 'location', {
          value: {
            set href(_) {
              assignMock();
            },
            get href() {
              return '';
            },
            assign: mockResponse,
          },
          writable: true,
        });
        await userEvent.click(screen.getByText('Email support'));
        expect(assignMock).toHaveBeenCalled();
      });
    });
  });
});
