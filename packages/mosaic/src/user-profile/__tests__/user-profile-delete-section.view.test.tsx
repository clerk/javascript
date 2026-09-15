import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { UserProfileDeleteSectionView } from '../user-profile-delete-section/user-profile-delete-section.view';

function renderView(onDelete: () => Promise<void> = vi.fn(() => Promise.resolve())) {
  return render(
    <MosaicProvider>
      <UserProfileDeleteSectionView onDelete={onDelete} />
    </MosaicProvider>,
  );
}

const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Delete account' }));
  return screen.getByRole('dialog');
};

describe('UserProfileDeleteSectionView', () => {
  it('renders the danger zone with the dialog closed', () => {
    renderView();

    expect(screen.getByRole('heading', { name: 'Danger zone' })).toBeInTheDocument();
    expect(
      screen.getByText('Permanently delete this account and all its data. This cannot be undone.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('deletes only after the phrase is typed back, then closes', async () => {
    const onDelete = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    renderView(onDelete);

    const dialog = await openDialog(user);
    const confirm = within(dialog).getByRole('button', { name: 'Delete account' });

    expect(within(dialog).getByText('Type “Delete account” below to continue')).toBeInTheDocument();
    expect(confirm).toHaveAttribute('aria-disabled', 'true');

    await user.type(within(dialog).getByRole('textbox'), 'Delete account');
    await user.click(confirm);

    expect(onDelete).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('keeps the dialog up and explains a failed delete', async () => {
    const user = userEvent.setup();
    renderView(() => Promise.reject(new Error('Your subscription is still active.')));

    const dialog = await openDialog(user);
    await user.type(within(dialog).getByRole('textbox'), 'Delete account');
    await user.click(within(dialog).getByRole('button', { name: 'Delete account' }));

    expect(await screen.findByText('Your subscription is still active.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('clears the phrase when the dialog is cancelled', async () => {
    const user = userEvent.setup();
    renderView();

    const dialog = await openDialog(user);
    await user.type(within(dialog).getByRole('textbox'), 'Delete account');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await openDialog(user);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});
