import type { SignInResource } from '@clerk/types';
import { describe, it } from '@jest/globals';

import { bindCreateFixtures, render, screen } from '../../../../testUtils';
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

  describe('Actions', () => {
    it('resets the password and does not require MFA', async () => {
      const { wrapper, fixtures } = await createFixtures();
      fixtures.signIn.resetPassword.mockResolvedValue({
        status: 'complete',
        createdSessionId: '1234_session_id',
        resetPasswordFlow: {
          hasNewPassword: true,
          commType: 'email_address',
        },
      } as SignInResource);
      const { userEvent } = render(<ResetPassword />, { wrapper });

      await userEvent.type(screen.getByLabelText(/New password/i), 'testtest');
      await userEvent.type(screen.getByLabelText(/Confirm password/i), 'testtest');
      await userEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
      expect(fixtures.signIn.resetPassword).toHaveBeenCalledWith({
        password: 'testtest',
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
        resetPasswordFlow: {
          hasNewPassword: true,
        },
      } as SignInResource);
      const { userEvent } = render(<ResetPassword />, { wrapper });

      await userEvent.type(screen.getByLabelText(/New password/i), 'testtest');
      await userEvent.type(screen.getByLabelText(/Confirm password/i), 'testtest');
      await userEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../factor-two');
    });

    it('results in error if the passwords do not match', async () => {
      const { wrapper } = await createFixtures();

      const { baseElement, userEvent } = render(<ResetPassword />, { wrapper });

      await userEvent.type(screen.getByLabelText(/new password/i), 'testewrewr');
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'testrwerrwqrwe');
      await userEvent.click(baseElement); //so that error renders
      screen.getByText(/match/i);
    });

    it('navigates to the root page upon pressing the back link', async () => {
      const { wrapper, fixtures } = await createFixtures();

      const { userEvent } = render(<ResetPassword />, { wrapper });

      await userEvent.click(screen.getByText(/back/i));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('../');
    });
  });
});
