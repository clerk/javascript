import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { TaskResetPassword } from '..';

const { createFixtures } = bindCreateFixtures('TaskResetPassword');

describe('TaskResetPassword', () => {
  it('does not render component without existing session task', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({
        email_addresses: ['test@clerk.com'],
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
        tasks: [{ key: 'reset-password' }],
      });
    });

    const { queryByText, queryByRole } = render(<TaskResetPassword />, { wrapper });

    expect(queryByText('New password')).toBeInTheDocument();
    expect(queryByText('Confirm password')).toBeInTheDocument();
    expect(queryByText('Sign out of all other devices')).toBeInTheDocument();
    expect(queryByRole('link', { name: /sign out/i })).toBeInTheDocument();
  });

  it('renders the task components in the order of the tasks', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        tasks: [{ key: 'reset-password' }, { key: 'choose-organization' }],
      });
    });

    const { queryByText, queryByRole } = render(<TaskResetPassword />, { wrapper });

    expect(queryByText('New password')).toBeInTheDocument();
    expect(queryByText('Confirm password')).toBeInTheDocument();
    expect(queryByText('Sign out of all other devices')).toBeInTheDocument();
    expect(queryByRole('link', { name: /sign out/i })).toBeInTheDocument();
  });

  it('displays user identifier in sign out section', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({
        email_addresses: ['user@test.com'],
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
