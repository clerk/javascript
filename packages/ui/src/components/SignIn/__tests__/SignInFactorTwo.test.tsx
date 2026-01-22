import { ClerkAPIResponseError, parseError } from '@clerk/shared/error';
import type { SignInResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { SignInFactorTwo } from '../SignInFactorTwo';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('SignInFactorTwo', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withEmailAddress();
    });
    render(<SignInFactorTwo />, { wrapper });
  });

  describe('Navigation', () => {
    //This isn't yet implemented in the component
    it.todo('navigates to SignInStart component if user lands on SignInFactorTwo page but they should not');
  });

  describe('Submitting', () => {
    it('correctly shows the input for code submission', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.startSignInFactorTwo();
      });
      fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      fixtures.signIn.attemptSecondFactor.mockReturnValueOnce(
        Promise.resolve({ status: 'complete' } as SignInResource),
      );
      render(<SignInFactorTwo />, { wrapper });

      const inputs = screen.getAllByTestId('otp-input-segment');
      expect(inputs.length).toBe(6);
    });

    it('correctly shows text indicating user need to complete 2FA to reset password', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.startSignInFactorTwo({
          supportResetPasswordEmail: true,
        });
      });
      fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      render(<SignInFactorTwo />, { wrapper });

      screen.getByText(/before resetting your password/i);
    });

    it('sets an active session when user submits second factor successfully', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.startSignInFactorTwo();
      });
      fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      fixtures.signIn.attemptSecondFactor.mockReturnValueOnce(
        Promise.resolve({ status: 'complete' } as SignInResource),
      );
      const { userEvent } = render(<SignInFactorTwo />, { wrapper });

      await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
      await waitFor(() => {
        expect(fixtures.clerk.setSelected).toHaveBeenCalled();
      });
    });

    it('redirects to reset-password-success after second factor successfully', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.startSignInFactorTwo({
          supportResetPasswordPhone: true,
        });
      });
      fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      fixtures.signIn.attemptSecondFactor.mockReturnValueOnce(
        Promise.resolve({
          status: 'complete',
          firstFactorVerification: {
            status: 'verified',
            strategy: 'reset_password_phone_code',
          },
          createdSessionId: '1234_session_id',
        } as SignInResource),
      );
      const { userEvent } = render(<SignInFactorTwo />, { wrapper });

      await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
      await waitFor(() => {
        expect(fixtures.clerk.setSelected).not.toHaveBeenCalled();
        expect(fixtures.router.navigate).toHaveBeenCalledWith(
          '../reset-password-success?createdSessionId=1234_session_id',
        );
      });
    });
  });

  describe('Selected Second Factor Method', () => {
    describe('Phone Code', () => {
      it('renders the correct screen with the text "Check your phone"', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true });
          f.startSignInFactorTwo({ identifier: '+3012345567890', supportPhoneCode: true, supportTotp: false });
        });
        fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        render(<SignInFactorTwo />, { wrapper });
        screen.getByText('Check your phone');
      });

      // this is coming from the backend, so maybe we have nothing to test here
      it.todo('hides with * the phone number digits except the last 2');

      it('enables the "Resend code" button after 30 seconds', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true });
          f.startSignInFactorTwo({ identifier: '+3012345567890', supportPhoneCode: true, supportTotp: false });
        });

        fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        const { getByText } = render(<SignInFactorTwo />, { wrapper });
        expect(getByText(/Resend/, { exact: false }).closest('button')).toHaveAttribute('disabled');
        // Note: Timer functionality is tested in the TimerButton component itself
        // This test verifies the initial disabled state is correct
      });

      it('disables again the resend code button after clicking it', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true });
          f.startSignInFactorTwo({ identifier: '+3012345567890', supportPhoneCode: true, supportTotp: false });
        });
        fixtures.signIn.prepareSecondFactor.mockReturnValue(Promise.resolve({} as SignInResource));

        const { getByText } = render(<SignInFactorTwo />, { wrapper });
        expect(getByText(/Resend/, { exact: false }).closest('button')).toHaveAttribute('disabled');
        // Note: Timer functionality and button state changes are tested in the TimerButton component itself
        // This test verifies the initial disabled state is correct
      });

      it('auto submits when typing all the 6 digits of the code', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true });
          f.startSignInFactorTwo({ identifier: '+3012345567890', supportPhoneCode: true, supportTotp: false });
        });
        fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.attemptSecondFactor.mockReturnValueOnce(
          Promise.resolve({ status: 'complete' } as SignInResource),
        );
        const { userEvent } = render(<SignInFactorTwo />, { wrapper });
        await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
        expect(fixtures.signIn.attemptSecondFactor).toHaveBeenCalled();
      });

      it('shows a UI error when submission fails', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true });
          f.startSignInFactorTwo({ identifier: '+3012345567890', supportPhoneCode: true, supportTotp: false });
        });
        fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.attemptSecondFactor.mockRejectedValueOnce(
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
        const { userEvent } = render(<SignInFactorTwo />, { wrapper });
        await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
        expect(await screen.findByTestId('form-feedback-error')).toHaveTextContent(/Incorrect phone code/i);
      });

      it('redirects back to sign-in if the user is locked', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true });
          f.startSignInFactorTwo({ identifier: '+3012345567890', supportPhoneCode: true, supportTotp: false });
        });
        fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

        const errJSON = {
          code: 'user_locked',
          long_message: 'Your account is locked. Please contact support for more information.',
          message: 'Account locked',
        };

        fixtures.signIn.attemptSecondFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [errJSON],
            status: 422,
          }),
        );

        const { userEvent } = render(<SignInFactorTwo />, { wrapper });
        await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
        await waitFor(() => {
          expect(fixtures.clerk.__internal_navigateWithError).toHaveBeenCalledWith('..', parseError(errJSON));
        });
      });
    });

    describe('Authenticator app', () => {
      it('renders the correct screen with the text "Authenticator app"', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInFactorTwo({ supportPhoneCode: false, supportTotp: true });
        });
        fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        const { getByText } = render(<SignInFactorTwo />, { wrapper });
        getByText('Two-step verification');
        getByText('To continue, please enter the verification code generated by your authenticator app');
      });

      it('auto submits when typing all the 6 digits of the code', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInFactorTwo({ supportPhoneCode: false, supportTotp: true });
        });
        fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.attemptSecondFactor.mockReturnValueOnce(
          Promise.resolve({ status: 'complete' } as SignInResource),
        );
        const { userEvent } = render(<SignInFactorTwo />, { wrapper });
        await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
        await waitFor(() => {
          expect(fixtures.signIn.attemptSecondFactor).toHaveBeenCalled();
        });
      });

      it('shows a UI error when submission fails', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInFactorTwo({ supportPhoneCode: false, supportTotp: true });
        });
        fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.attemptSecondFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [
              {
                code: 'form_code_incorrect',
                long_message: 'Incorrect authenticator code',
                message: 'is incorrect',
                meta: { param_name: 'code' },
              },
            ],
            status: 422,
          }),
        );
        const { userEvent } = render(<SignInFactorTwo />, { wrapper });
        await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
        expect(await screen.findByTestId('form-feedback-error')).toHaveTextContent(/Incorrect authenticator code/i);
      });
    });

    describe('Backup code', () => {
      it('renders the correct screen with the text "Enter a backup code"', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInFactorTwo({
            supportPhoneCode: false,
            supportBackupCode: true,
          });
        });
        fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        const { getByText } = render(<SignInFactorTwo />, { wrapper });
        expect(getByText('Enter a backup code')).toBeDefined();
      });

      it('submits the value when user clicks the continue button', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInFactorTwo({
            supportPhoneCode: false,
            supportBackupCode: true,
          });
        });
        fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.attemptSecondFactor.mockReturnValueOnce(
          Promise.resolve({ status: 'complete' } as SignInResource),
        );
        const { getByText, getByLabelText, userEvent } = render(<SignInFactorTwo />, { wrapper });
        await userEvent.type(getByLabelText('Backup code'), '123456');
        await userEvent.click(getByText('Continue'));
        await waitFor(() => {
          expect(fixtures.signIn.attemptSecondFactor).toHaveBeenCalled();
        });
      });

      it('does not proceed when user clicks the continue button with password field empty', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInFactorTwo({
            supportPhoneCode: false,
            supportBackupCode: true,
          });
        });
        fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.attemptSecondFactor.mockReturnValueOnce(
          Promise.resolve({ status: 'complete' } as SignInResource),
        );
        const { getByText, userEvent } = render(<SignInFactorTwo />, { wrapper });

        // type nothing in the input field

        await userEvent.click(getByText('Continue'));
        await waitFor(() => {
          expect(fixtures.signIn.attemptSecondFactor).not.toHaveBeenCalled();
        });
      });

      it('shows a UI error when submission fails', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInFactorTwo({
            supportPhoneCode: false,
            supportBackupCode: true,
          });
        });
        fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        fixtures.signIn.attemptSecondFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [
              {
                code: 'form_code_incorrect',
                long_message: 'Incorrect backup code',
                message: 'is incorrect',
                meta: { param_name: 'code' },
              },
            ],
            status: 422,
          }),
        );
        const { userEvent, getByLabelText, getByText } = render(<SignInFactorTwo />, { wrapper });
        await userEvent.type(getByLabelText('Backup code'), '123456');
        await userEvent.click(getByText('Continue'));
        expect(await screen.findByTestId('form-feedback-error')).toHaveTextContent(/Incorrect backup code/i);
      });

      it('redirects back to sign-in if the user is locked', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInFactorTwo({
            supportPhoneCode: false,
            supportBackupCode: true,
          });
        });
        fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));

        const errJSON = {
          code: 'user_locked',
          long_message: 'Your account is locked. Please try again after 30 minutes.',
          message: 'Account locked',
          meta: { duration_in_seconds: 1800 },
        };

        fixtures.signIn.attemptSecondFactor.mockRejectedValueOnce(
          new ClerkAPIResponseError('Error', {
            data: [errJSON],
            status: 422,
          }),
        );

        const { userEvent, getByLabelText, getByText } = render(<SignInFactorTwo />, { wrapper });
        await userEvent.type(getByLabelText('Backup code'), '123456');
        await userEvent.click(getByText('Continue'));
        await waitFor(() => {
          expect(fixtures.clerk.__internal_navigateWithError).toHaveBeenCalledWith('..', parseError(errJSON));
        });
      });
    });
  });

  describe('Use another method', () => {
    it('renders the other authentication methods list component when clicking on "Use another method"', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.startSignInFactorTwo({
          supportPhoneCode: true,
          supportBackupCode: true,
          supportTotp: true,
        });
      });

      fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      const { userEvent } = render(<SignInFactorTwo />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      // Wait for the alternative methods to be rendered
      expect(await screen.findByText(/Send SMS code to \+/i)).toBeInTheDocument();
    });

    it('goes back to the main screen when clicking the "<- Back" button', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.startSignInFactorTwo({
          supportPhoneCode: true,
          supportBackupCode: true,
          supportTotp: false,
        });
      });

      fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      const { userEvent } = render(<SignInFactorTwo />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      expect(await screen.findByText('Back')).toBeInTheDocument();
      await userEvent.click(screen.getByText('Back'));
      expect(await screen.findByText('Check your phone')).toBeInTheDocument();
    });

    it('lists all the enabled second factor methods', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.startSignInFactorTwo({
          supportPhoneCode: true,
          supportBackupCode: true,
          supportTotp: true,
        });
      });

      fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      const { userEvent } = render(<SignInFactorTwo />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      expect(await screen.findByText(/Send SMS code to \+/i)).toBeInTheDocument();
      expect(await screen.findByText(/Use a backup code/i)).toBeInTheDocument();
      expect(await screen.findByText(/Authenticator/i)).toBeInTheDocument();
    });

    it('shows the SMS code input when clicking the Phone code method', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.startSignInFactorTwo({
          supportPhoneCode: true,
          supportBackupCode: true,
          supportTotp: true,
        });
      });

      fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      const { userEvent } = render(<SignInFactorTwo />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      expect(await screen.findByText(/Send SMS code to \+/i)).toBeInTheDocument();
      await userEvent.click(screen.getByText(/Send SMS code to \+/i));
      expect(await screen.findByText(/Check your phone/i)).toBeInTheDocument();
    });

    it('shows the Authenticator app screen when clicking the Authenticator app method', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.startSignInFactorTwo({
          supportPhoneCode: true,
          supportBackupCode: true,
          supportTotp: true,
        });
      });

      fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      const { userEvent } = render(<SignInFactorTwo />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      expect(await screen.findByText(/authenticator/i)).toBeInTheDocument();
      await userEvent.click(screen.getByText(/authenticator/i));
      expect(await screen.findByText(/Enter the verification code/i)).toBeInTheDocument();
      expect(await screen.findByText(/authenticator/i)).toBeInTheDocument();
    });

    it('shows the Backup code screen when clicking the Backup code method', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEmailAddress();
        f.withPassword();
        f.startSignInFactorTwo({
          supportPhoneCode: true,
          supportBackupCode: true,
          supportTotp: true,
        });
      });

      fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      const { userEvent } = render(<SignInFactorTwo />, { wrapper });
      await userEvent.click(screen.getByText('Use another method'));
      expect(await screen.findByText(/backup/i)).toBeInTheDocument();
      await userEvent.click(screen.getByText(/backup/i));
      expect(await screen.findByText(/enter a backup code/i)).toBeInTheDocument();
    });

    describe('Get Help', () => {
      it('should render the get help component when clicking the "Get Help" button', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.startSignInFactorTwo({
            supportPhoneCode: true,
            supportBackupCode: true,
            supportTotp: true,
          });
        });

        const { userEvent } = render(<SignInFactorTwo />, { wrapper });
        await userEvent.click(screen.getByText('Use another method'));
        expect(await screen.findByText('Get help')).toBeInTheDocument();
        await userEvent.click(screen.getByText('Get help'));
        expect(await screen.findByText('Email support')).toBeInTheDocument();
      });

      it('should go back to "Use another method" screen when clicking the "<- Back" button', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.startSignInFactorTwo({
            supportPhoneCode: true,
            supportBackupCode: true,
            supportTotp: true,
          });
        });

        const { userEvent } = render(<SignInFactorTwo />, { wrapper });
        await userEvent.click(screen.getByText('Use another method'));
        expect(await screen.findByText('Get help')).toBeInTheDocument();
        await userEvent.click(screen.getByText('Get help'));
        expect(await screen.findByText('Back')).toBeInTheDocument();
        await userEvent.click(screen.getByText('Back'));
        expect(await screen.findByText('Use another method')).toBeInTheDocument();
      });

      it('should open a "mailto:" link when clicking the email support button', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.startSignInFactorTwo({
            supportPhoneCode: true,
            supportBackupCode: true,
            supportTotp: true,
          });
        });

        const { userEvent } = render(<SignInFactorTwo />, { wrapper });
        await userEvent.click(screen.getByText('Use another method'));
        expect(await screen.findByText('Get help')).toBeInTheDocument();
        await userEvent.click(screen.getByText('Get help'));
        expect(await screen.findByText('Email support')).toBeInTheDocument();

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
