import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileNameRowView } from '../user-profile-account-section/user-profile-name-row.view';

describe('UserProfileNameRowView', () => {
  it('offers to set a name the user does not have yet', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <UserProfileNameRowView
          name=''
          onSubmit={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(document.querySelector('.cl-section-description')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Set name' }));
    expect(screen.getByRole('dialog', { name: 'Set name' })).toBeInTheDocument();
  });
});
