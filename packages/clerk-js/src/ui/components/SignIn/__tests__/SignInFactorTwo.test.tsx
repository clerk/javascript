import { SignInResource } from '@clerk/types';
import { describe, it, jest } from '@jest/globals';
import React from 'react';

import { ClerkAPIResponseError } from '../../../../core/resources';
import { act, bindCreateFixtures, fireEvent, render, screen, waitFor } from '../../../../testUtils';
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

    it('sets an active session when user submits second factor successfully', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.startSignInFactorTwo();
      });
      fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
      fixtures.signIn.attemptSecondFactor.mockReturnValueOnce(
        Promise.resolve({ status: 'complete' } as SignInResource),
      );
      render(<SignInFactorTwo />, { wrapper });

      const inputs = screen.getAllByLabelText(/digit/i);
      inputs.every(input => {
        return fireEvent.change(input, { target: { value: '1' } });
      });
      await waitFor(() => {
        expect(fixtures.clerk.setActive).toBeCalled();
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
        jest.useFakeTimers();

        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true });
          f.startSignInFactorTwo({ identifier: '+3012345567890', supportPhoneCode: true, supportTotp: false });
        });

        fixtures.signIn.prepareSecondFactor.mockReturnValueOnce(Promise.resolve({} as SignInResource));
        const { getByText } = render(<SignInFactorTwo />, { wrapper });
        expect(getByText('Resend code', { exact: false }).closest('button')).toHaveAttribute('disabled');
        act(() => {
          jest.advanceTimersByTime(15000);
        });
        expect(getByText('Resend code', { exact: false }).closest('button')).toHaveAttribute('disabled');
        act(() => {
          jest.advanceTimersByTime(15000);
        });
        expect(getByText('Resend code', { exact: false }).closest('button')).not.toHaveAttribute('disabled');

        jest.useRealTimers();
      });

      it('disables again the resend code button after clicking it', async () => {
        jest.useFakeTimers();

        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInWithPhoneNumber({ supportPhoneCode: true });
          f.startSignInFactorTwo({ identifier: '+3012345567890', supportPhoneCode: true, supportTotp: false });
        });

        fixtures.signIn.prepareSecondFactor.mockReturnValue(Promise.resolve({} as SignInResource));
        const { getByText, userEvent } = render(<SignInFactorTwo />, { wrapper });
        expect(getByText('Resend code', { exact: false }).closest('button')).toHaveAttribute('disabled');
        act(() => {
          jest.advanceTimersByTime(30000);
        });
        expect(getByText('Resend code').closest('button')).not.toHaveAttribute('disabled');
        await userEvent.click(getByText('Resend code'));
        act(() => {
          jest.advanceTimersByTime(1000);
        });
        expect(getByText('Resend code', { exact: false }).closest('button')).toHaveAttribute('disabled');

        jest.useRealTimers();
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
        await waitFor(() => expect(screen.getByText('Incorrect phone code')).toBeDefined());
      });
    });

    describe('Authenticator app', () => {
      it('renders the correct screen with the text "Authenticator app"', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInFactorTwo({ identifier: 'stefanos@clerk.dev', supportPhoneCode: false, supportTotp: true });
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
          f.startSignInFactorTwo({ identifier: 'stefanos@clerk.dev', supportPhoneCode: false, supportTotp: true });
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
          f.startSignInFactorTwo({ identifier: 'stefanos@clerk.dev', supportPhoneCode: false, supportTotp: true });
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
        await waitFor(() => expect(screen.getByText('Incorrect authenticator code')).toBeDefined());
      });
    });

    describe('Backup code', () => {
      it('renders the correct screen with the text "Enter a backup code"', async () => {
        const { wrapper, fixtures } = await createFixtures(f => {
          f.withEmailAddress();
          f.withPassword();
          f.withPreferredSignInStrategy({ strategy: 'otp' });
          f.startSignInFactorTwo({
            identifier: 'stefanos@clerk.dev',
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
            identifier: 'stefanos@clerk.dev',
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
            identifier: 'stefanos@clerk.dev',
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
            identifier: 'stefanos@clerk.dev',
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
        await waitFor(() => expect(screen.getByText('Incorrect backup code')).toBeDefined());
      });
    });
  });

  describe('Use another method', () => {
    it.todo('renders the other authentication methods list component when clicking on "Use another method"');
    it.todo('goes back to the main screen when clicking the "<- Back" button');
    it.todo('lists all the enabled second factor methods');
    it.todo('shows the SMS code input when clicking the Phone code method');
    it.todo('shows the Authenticator app screen when clicking the Authenticator app method');
    it.todo('shows the Backup code screen when clicking the Backup code method');

    describe('Get Help', () => {
      it.todo('renders the get help component when clicking the "Get Help" button');
      it.todo('goes back to "Use another method" screen when clicking the "<- Back" button');
      it.todo('opens a "mailto:" link when clicking the email support button');
    });
  });
});
