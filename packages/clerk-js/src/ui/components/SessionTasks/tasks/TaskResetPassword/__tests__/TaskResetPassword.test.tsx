import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { TaskResetPassword } from '..';

const { createFixtures } = bindCreateFixtures('TaskResetPassword');

describe('TaskResetPassword', () => {
  it('does not render component without existing session task', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({
        email_addresses: ['test@clerk.com'],
        identifier: 'test@clerk.com',
      });
    });

    const { queryByText, queryByRole } = render(<TaskResetPassword />, { wrapper });

    expect(queryByText('New password')).not.toBeInTheDocument();
    expect(queryByText('Confirm password')).not.toBeInTheDocument();
    expect(queryByText('Sign out of all other devices')).not.toBeInTheDocument();
    expect(queryByRole('link', { name: /sign out/i })).not.toBeInTheDocument();
  });

  it('renders component when session task exists', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({
        email_addresses: ['test@clerk.com'],
        identifier: 'test@clerk.com',
        tasks: [{ key: 'reset-password' }],
      });
    });

    const { queryByText, queryByRole } = render(<TaskResetPassword />, { wrapper });

    expect(queryByText('New password')).toBeInTheDocument();
    expect(queryByText('Confirm password')).toBeInTheDocument();
    expect(queryByText('Sign out of all other devices')).toBeInTheDocument();
    expect(queryByRole('link', { name: /sign out/i })).toBeInTheDocument();
  });

  it('tries to reset the password and calls the appropriate function', async () => {
    const { wrapper, fixtures } = await createFixtures(f =>
      f.withUser({
        email_addresses: ['test@clerk.com'],
        identifier: 'test@clerk.com',
        tasks: [{ key: 'reset-password' }],
      }),
    );

    fixtures.clerk.user?.updatePassword.mockResolvedValue({});
    const { getByRole, userEvent, getByLabelText } = render(<TaskResetPassword />, { wrapper });
    await waitFor(() => getByRole('heading', { name: /Reset password/i }));

    await userEvent.type(getByLabelText(/new password/i), 'testtest');
    await userEvent.type(getByLabelText(/confirm password/i), 'testtest');
    await userEvent.click(getByRole('button', { name: /reset password$/i }));
    expect(fixtures.clerk.user?.updatePassword).toHaveBeenCalledWith({
      newPassword: 'testtest',
      signOutOfOtherSessions: true,
    });
  });

  it('renders a hidden identifier field', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({
        email_addresses: ['test@clerk.com'],
        identifier: 'test@clerk.com',
        tasks: [{ key: 'reset-password' }],
      });
    });
    const { getByRole, getByTestId } = render(<TaskResetPassword />, { wrapper });
    await waitFor(() => getByRole('heading', { name: /Reset password/i }));

    const identifierField = getByTestId('hidden-identifier');
    expect(identifierField).toHaveValue('test@clerk.com');
  });

  it('displays user identifier in sign out section', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({
        email_addresses: ['user@test.com'],
        identifier: 'user@test.com',
        tasks: [{ key: 'reset-password' }],
      });
    });

    const { findByText } = render(<TaskResetPassword />, { wrapper });

    expect(await findByText(/user@test\.com/)).toBeInTheDocument();
    expect(await findByText('Sign out')).toBeInTheDocument();
  });

  it('handles sign out correctly', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({
        email_addresses: ['test@clerk.com'],
        identifier: 'test@clerk.com',
        tasks: [{ key: 'reset-password' }],
      });
    });

    const { findByRole } = render(<TaskResetPassword />, { wrapper });
    const signOutButton = await findByRole('link', { name: /sign out/i });

    await userEvent.click(signOutButton);

    expect(fixtures.clerk.signOut).toHaveBeenCalled();
  });

  it('renders with username when email is not available', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({
        username: 'testuser',
        tasks: [{ key: 'reset-password' }],
      });
    });

    const { findByText } = render(<TaskResetPassword />, { wrapper });

    expect(await findByText(/testuser/)).toBeInTheDocument();
  });
});
