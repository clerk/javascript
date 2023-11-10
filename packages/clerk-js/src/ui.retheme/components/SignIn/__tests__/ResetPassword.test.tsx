import type { SignInResource } from '@clerk/types';
import { describe, it } from '@jest/globals';

import { bindCreateFixtures, fireEvent, render, runFakeTimers, screen, waitFor } from '../../../../testUtils';
import { ResetPassword } from '../ResetPassword';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('ResetPassword', () => {
  it('renders the component', async () => {
    const { wrapper } = await createFixtures();

    render(<ResetPassword />, { wrapper });
    screen.getByRole('heading', { name: /Reset password/i });

    screen.getByLabelText(/New password/i);
    screen.getByLabelText(/Confirm password/i);
  });

  it('renders information text below Password field', async () => {
    const { wrapper } = await createFixtures(f =>
      f.withPasswordComplexity({
        allowed_special_characters: '',
        max_length: 999,
        min_length: 8,
        require_special_char: true,
        require_numbers: true,
        require_lowercase: true,
        require_uppercase: true,
      }),
    );

    await runFakeTimers(async () => {
      render(<ResetPassword />, { wrapper });
      screen.getByRole('heading', { name: /Reset password/i });

      const passwordField = screen.getByLabelText(/New password/i);
      fireEvent.focus(passwordField);
      await waitFor(() => {
        screen.getByText(/Your password must contain 8 or more characters/i);
      });
    });
  });

  it('renders a hidden identifier field', async () => {
    const identifier = 'test@clerk.com';
    const { wrapper } = await createFixtures(f => {
      f.startSignInWithEmailAddress({ identifier });
    });
    render(<ResetPassword />, { wrapper });

    const identifierField: HTMLInputElement = screen.getByTestId('hidden-identifier');
    expect(identifierField.value).toBe(identifier);
  });

  describe('Actions', () => {
    it('resets the password and does not require MFA', async () => {
      const { wrapper, fixtures } = await createFixtures();
      fixtures.signIn.resetPassword.mockResolvedValue({
        status: 'complete',
        createdSessionId: '1234_session_id',
      } as SignInResource);
      const { userEvent } = render(<ResetPassword />, { wrapper });

      await userEvent.type(screen.getByLabelText(/New password/i), 'testtest');
      await userEvent.type(screen.getByLabelText(/Confirm password/i), 'testtest');
      await userEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
      expect(fixtures.signIn.resetPassword).toHaveBeenCalledWith({
        password: 'testtest',
        signOutOfOtherSessions: true,
      });
      expect(fixtures.router.navigate).toHaveBeenCalledWith(
        '../reset-password-success?createdSessionId=1234_session_id',
      );
    });

    it('resets the password, does not require MFA and leaves sessions intact', async () => {
      const { wrapper, fixtures } = await createFixtures();
      fixtures.signIn.resetPassword.mockResolvedValue({
        status: 'complete',
        createdSessionId: '1234_session_id',
      } as SignInResource);
      const { userEvent } = render(<ResetPassword />, { wrapper });

      await userEvent.type(screen.getByLabelText(/New password/i), 'testtest');
      await userEvent.type(screen.getByLabelText(/Confirm password/i), 'testtest');
      await userEvent.click(screen.getByRole('checkbox', { name: /sign out of all other devices/i }));
      await userEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
      expect(fixtures.signIn.resetPassword).toHaveBeenCalledWith({
        password: 'testtest',
        signOutOfOtherSessions: false,
      });
      expect(fixtures.router.navigate).toHaveBeenCalledWith(
        '../reset-password-success?createdSessionId=1234_session_id',
      );
    });

    it('resets the password and requires MFA', async () => {
      const { wrapper, fixtures } = await createFixtures();
      fixtures.signIn.resetPassword.mockResolvedValue({
        status: 'needs_second_factor',
        createdSessionId: '1234_session_id',
      } as SignInResource);
      const { userEvent } = render(<ResetPassword />, { wrapper });

      await userEvent.type(screen.getByLabelText(/New password/i), 'testtest');
      await userEvent.type(screen.getByLabelText(/Confirm password/i), 'testtest');
      await userEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../factor-two');
    });

    it('results in error if the passwords do not match and persists', async () => {
      const { wrapper } = await createFixtures();

      await runFakeTimers(async () => {
        const { userEvent } = render(<ResetPassword />, { wrapper });

        await userEvent.type(screen.getByLabelText(/new password/i), 'testewrewr');
        const confirmField = screen.getByLabelText(/confirm password/i);
        await userEvent.type(confirmField, 'testrwerrwqrwe');
        await waitFor(() => {
          expect(screen.getByText(`Passwords don't match.`)).toBeInTheDocument();
        });

        await userEvent.clear(confirmField);
        await waitFor(() => {
          expect(screen.getByText(`Passwords don't match.`)).toBeInTheDocument();
        });
      });
    }, 10000);

    it('navigates to the root page upon pressing the back link', async () => {
      const { wrapper, fixtures } = await createFixtures();

      const { userEvent } = render(<ResetPassword />, { wrapper });

      await userEvent.click(screen.getByText(/back/i));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../');
    });

    it('resets the password, when it is required for the user', async () => {
      const { wrapper, fixtures } = await createFixtures();
      fixtures.clerk.client.signIn.status = 'needs_new_password';
      fixtures.clerk.client.signIn.firstFactorVerification.strategy = 'oauth_google';
      fixtures.signIn.resetPassword.mockResolvedValue({
        status: 'complete',
        createdSessionId: '1234_session_id',
      } as SignInResource);
      const { userEvent } = render(<ResetPassword />, { wrapper });

      expect(screen.queryByText(/account already exists/i)).toBeInTheDocument();
      expect(screen.queryByRole('checkbox', { name: /sign out of all other devices/i })).not.toBeInTheDocument();
      await userEvent.type(screen.getByLabelText(/New password/i), 'testtest');
      await userEvent.type(screen.getByLabelText(/Confirm password/i), 'testtest');
      await userEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
      expect(fixtures.signIn.resetPassword).toHaveBeenCalledWith({
        password: 'testtest',
        signOutOfOtherSessions: true,
      });
      expect(fixtures.router.navigate).toHaveBeenCalledWith(
        '../reset-password-success?createdSessionId=1234_session_id',
      );
    });
  });
});
