import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileSaveError } from '../user-profile-account-section/user-profile-account-section.types';
import type { UserProfilePasswordSectionViewProps } from '../user-profile-password-section/user-profile-password-section.types';
import { UserProfilePasswordSectionView } from '../user-profile-password-section/user-profile-password-section.view';

function renderView(props: UserProfilePasswordSectionViewProps = {}) {
  return render(
    <MosaicProvider>
      <UserProfilePasswordSectionView {...props} />
    </MosaicProvider>,
  );
}

describe('UserProfilePasswordSectionView', () => {
  it('changes a password and closes the dialog after saving', async () => {
    const onSubmitPassword = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    renderView({ hasPassword: true, requiresCurrentPassword: true, onSubmitPassword });

    expect(screen.getByText('••••••••••••••••••')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Change password' }));
    const dialog = screen.getByRole('dialog', { name: 'Change password' });
    await user.type(within(dialog).getByLabelText('Current password'), 'old-secret');
    await user.type(within(dialog).getByLabelText('New password'), 'new-secret-123');
    await user.type(within(dialog).getByLabelText('Confirm password'), 'new-secret-123');
    await user.click(within(dialog).getByRole('checkbox', { name: 'Sign out of all other devices' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(onSubmitPassword).toHaveBeenCalledWith({
      currentPassword: 'old-secret',
      newPassword: 'new-secret-123',
      signOutOfOtherSessions: false,
    });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Change password' })).not.toBeInTheDocument());
  });

  it('offers to set a password when the instance takes one but the account has none', async () => {
    const onSubmitPassword = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    renderView({ hasPassword: false, onSubmitPassword });

    expect(screen.getByRole('heading', { level: 4, name: 'Authentication' })).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeVisible();
    expect(screen.queryByText('••••••••••••••••••')).not.toBeInTheDocument();
    expect(screen.getByText('No password set')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Set password' }));
    const dialog = screen.getByRole('dialog', { name: 'Set password' });
    expect(within(dialog).queryByLabelText('Current password')).not.toBeInTheDocument();
    await user.type(within(dialog).getByLabelText('New password'), 'new-secret-123');
    await user.type(within(dialog).getByLabelText('Confirm password'), 'new-secret-123');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(onSubmitPassword).toHaveBeenCalledWith({
      currentPassword: undefined,
      newPassword: 'new-secret-123',
      signOutOfOtherSessions: true,
    });
  });

  it('keeps entered values after a failure and closes after a corrected retry', async () => {
    const user = userEvent.setup();
    const onSubmitPassword = vi
      .fn()
      .mockRejectedValueOnce(
        new UserProfileSaveError('Your password could not be updated.', {
          currentPassword: 'Incorrect password.',
        }),
      )
      .mockResolvedValue(undefined);
    renderView({ hasPassword: true, requiresCurrentPassword: true, onSubmitPassword });

    await user.click(screen.getByRole('button', { name: 'Change password' }));
    await user.type(screen.getByLabelText('Current password'), 'incorrect-password');
    await user.type(screen.getByLabelText('New password'), 'new-secret-123');
    await user.type(screen.getByLabelText('Confirm password'), 'new-secret-123');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Your password could not be updated.');
    expect(screen.getByLabelText('Current password')).toHaveAccessibleDescription('Incorrect password.');
    expect(screen.getByLabelText('New password')).toHaveValue('new-secret-123');
    expect(screen.getByLabelText('Confirm password')).toHaveValue('new-secret-123');

    await user.clear(screen.getByLabelText('Current password'));
    await user.type(screen.getByLabelText('Current password'), 'correct-password');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Change password' })).toHaveFocus();
  });

  it('hides the entire section when there is no password, manager, or action', () => {
    const { container } = render(
      <MosaicProvider>
        <UserProfilePasswordSectionView />
      </MosaicProvider>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows an existing password without requiring an edit action', () => {
    render(
      <MosaicProvider>
        <UserProfilePasswordSectionView hasPassword />
      </MosaicProvider>,
    );

    expect(screen.getByRole('region', { name: 'Authentication' })).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the enterprise manager instead of password actions', () => {
    render(
      <MosaicProvider>
        <UserProfilePasswordSectionView
          managedBy={{ name: 'Okta' }}
          onSubmitPassword={vi.fn(() => Promise.resolve())}
        />
      </MosaicProvider>,
    );

    expect(screen.getByText('Managed by Okta')).toBeVisible();
    expect(screen.queryByRole('button', { name: /password/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
