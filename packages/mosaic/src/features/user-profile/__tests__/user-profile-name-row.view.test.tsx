import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileNameRowView } from '../user-profile-account-section/user-profile-name-row.view';

describe('UserProfileNameRowView', () => {
  it('offers to add a name the user does not have yet', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <UserProfileNameRowView
          name=''
          onSubmit={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(screen.getByText('No name added')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add name' }));
    expect(screen.getByRole('dialog', { name: 'Add name' })).toBeInTheDocument();
  });

  it('offers to edit a name the user has', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <UserProfileNameRowView
          name='Preston Booth'
          onSubmit={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(screen.getByText('Preston Booth')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit name' }));
    expect(screen.getByRole('dialog', { name: 'Edit name' })).toBeInTheDocument();
  });
  it('names the connection managing the name in place of the edit action', () => {
    render(
      <MosaicProvider>
        <UserProfileNameRowView
          name='Preston Booth'
          managedBy={{ name: 'Okta' }}
        />
      </MosaicProvider>,
    );

    expect(screen.getByText('Managed by Okta')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
