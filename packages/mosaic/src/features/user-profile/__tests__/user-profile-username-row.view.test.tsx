import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileUsernameRowView } from '../user-profile-account-section/user-profile-username-row.view';

describe('UserProfileUsernameRowView', () => {
  it('offers to add a username the user does not have yet', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <UserProfileUsernameRowView
          username=''
          onSubmit={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(screen.getByText('No username added')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add username' }));
    expect(screen.getByRole('dialog', { name: 'Add username' })).toBeInTheDocument();
  });

  it('offers to edit a username the user has', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <UserProfileUsernameRowView
          username='prestonxyz'
          onSubmit={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(screen.getByText('prestonxyz')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit username' }));
    expect(screen.getByRole('dialog', { name: 'Edit username' })).toBeInTheDocument();
  });
});
