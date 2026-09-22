import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileUsernameRowView } from '../user-profile-account-section/user-profile-username-row.view';

describe('UserProfileUsernameRowView', () => {
  it('offers to set a username the user does not have yet', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <UserProfileUsernameRowView
          username=''
          onSubmit={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(document.querySelector('.cl-section-description')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Set username' }));
    expect(screen.getByRole('dialog', { name: 'Set username' })).toBeInTheDocument();
  });
});
