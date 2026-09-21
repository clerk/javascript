import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { UserProfileDeleteSectionViewProps } from '../user-profile-delete-section/user-profile-delete-section.view';
import { UserProfileDeleteSectionView } from '../user-profile-delete-section/user-profile-delete-section.view';

function viewProps(overrides: Partial<UserProfileDeleteSectionViewProps> = {}): UserProfileDeleteSectionViewProps {
  return {
    isOpen: false,
    onOpenChange: vi.fn(),
    onConfirm: vi.fn(),
    isDeleting: false,
    errorMessage: undefined,
    ...overrides,
  };
}

function view(props: UserProfileDeleteSectionViewProps) {
  return (
    <MosaicProvider>
      <UserProfileDeleteSectionView {...props} />
    </MosaicProvider>
  );
}

function renderView(overrides: Partial<UserProfileDeleteSectionViewProps> = {}) {
  const props = viewProps(overrides);
  return { ...render(view(props)), props };
}

describe('UserProfileDeleteSectionView', () => {
  it('renders the danger zone and asks to open the dialog', async () => {
    const user = userEvent.setup();
    const { props } = renderView();

    expect(screen.getByRole('heading', { name: 'Danger zone' })).toBeInTheDocument();
    expect(
      screen.getByText('Permanently delete this account and all its data. This cannot be undone.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete account' }));
    expect(props.onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('confirms only after the phrase is typed back', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    renderView({ isOpen: true, onConfirm });

    const dialog = screen.getByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Delete account' });

    expect(within(dialog).getByText('Type “Delete account” below to continue')).toBeInTheDocument();
    expect(confirm).toHaveAttribute('aria-disabled', 'true');

    await user.type(within(dialog).getByRole('textbox'), 'Delete account');
    await user.click(confirm);

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('renders a delete failure while keeping the dialog open', () => {
    renderView({ isOpen: true, errorMessage: 'Your subscription is still active.' });

    expect(screen.getByText('Your subscription is still active.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('clears the phrase when the dialog is cancelled', async () => {
    const user = userEvent.setup();
    const props = viewProps({ isOpen: true });
    const { rerender } = render(view(props));

    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByRole('textbox'), 'Delete account');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(props.onOpenChange).toHaveBeenCalledWith(false, expect.anything());
    rerender(view({ ...props, isOpen: false }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    rerender(view({ ...props, isOpen: true }));
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});
