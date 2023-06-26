import type { SignInResource } from '@clerk/types';
import { describe, it } from '@jest/globals';

import { ClerkAPIResponseError } from '../../../../core/resources';
import { bindCreateFixtures, render, runFakeTimers, screen, waitFor } from '../../../../testUtils';
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

      const inputs = screen.getAllByLabelText(/digit/i);
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
      await runFakeTimers(async timers => {
        const { userEvent } = render(<SignInFactorTwo />, { wrapper });

        await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
        timers.runOnlyPendingTimers();
        await waitFor(() => {
          expect(fixtures.clerk.setActive).toHaveBeenCalled();
        });
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
        expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
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

        runFakeTimers(timers => {
          fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
          const { getByText } = render(<SignInFactorTwo />, { wrapper });
          expect(getByText(/Resend/, { exact: false }).closest('button')).toHaveAttribute('disabled');
          timers.advanceTimersByTime(15000);
          expect(getByText(/Resend/, { exact: false }).closest('button')).toHaveAttribute('disabled');
          getByText('(15)', { exact: false });
          timers.advanceTimersByTime(15000);
          expect(getByText(/Resend/, { exact: false }).closest('button')).not.toHaveAttribute('disabled');
        });
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

        await runFakeTimers(async timers => {
          const { getByText, userEvent } = render(<SignInFactorTwo />, { wrapper });
          expect(getByText(/Resend/, { exact: false }).closest('button')).toHaveAttribute('disabled');
          timers.advanceTimersByTime(30000);
          expect(getByText(/Resend/).closest('button')).not.toHaveAttribute('disabled');
          await userEvent.click(getByText(/Resend/));
          timers.advanceTimersByTime(1000);
          expect(getByText(/Resend/, { exact: false }).closest('button')).toHaveAttribute('disabled');
        });
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
        await runFakeTimers(async () => {
          const { userEvent } = render(<SignInFactorTwo />, { wrapper });
          await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
          await waitFor(() => expect(screen.getByText('Incorrect phone code')).toBeDefined());
        });
      }, 10000);
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
        expect(getByText('Enter the verification code generated by your authenticator app')).toBeDefined();
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
        expect(fixtures.signIn.attemptSecondFactor).toHaveBeenCalled();
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
        await runFakeTimers(async () => {
          const { userEvent } = render(<SignInFactorTwo />, { wrapper });
          await userEvent.type(screen.getByLabelText(/Enter verification code/i), '123456');
          await waitFor(() => expect(screen.getByText('Incorrect authenticator code')).toBeDefined());
        });
      }, 10000);
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
        expect(fixtures.signIn.attemptSecondFactor).toHaveBeenCalled();
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
        expect(fixtures.signIn.attemptSecondFactor).not.toHaveBeenCalled();
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
        await runFakeTimers(async () => {
          const { userEvent, getByLabelText, getByText } = render(<SignInFactorTwo />, { wrapper });
          await userEvent.type(getByLabelText('Backup code'), '123456');
          await userEvent.click(getByText('Continue'));
          await waitFor(() => expect(screen.getByText('Incorrect backup code')).toBeDefined());
        });
      }, 10000);
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
      await userEvent.click(screen.getByText('Back'));
      screen.getByText('Check your phone');
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
      screen.getByText(/Send SMS code to \+/i);
      screen.getByText(/Use a backup code/i);
      screen.getByText(/Authenticator/i);
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
      await userEvent.click(screen.getByText(/Send SMS code to \+/i));
      screen.getByText(/Check your phone/i);
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
      await userEvent.click(screen.getByText(/authenticator/i));
      screen.getByText(/Enter the verification code/i);
      screen.getByText(/authenticator/i);
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
      await userEvent.click(screen.getByText(/backup/i));
      screen.getByText(/enter a backup code/i);
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
        await userEvent.click(screen.getByText('Get help'));
        screen.getByText('Email support');
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
        await userEvent.click(screen.getByText('Get help'));
        await userEvent.click(screen.getByText('Back'));
        screen.getByText('Use another method');
      });

      // this test needs us to mock the window.location.href to work properly
      it.skip('should open a "mailto:" link when clicking the email support button', async () => {
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
        await userEvent.click(screen.getByText('Get help'));
        screen.getByText('Email support');
        await userEvent.click(screen.getByText('Email support'));
        //TODO: check that location.href setter is called
      });
    });
  });
});
