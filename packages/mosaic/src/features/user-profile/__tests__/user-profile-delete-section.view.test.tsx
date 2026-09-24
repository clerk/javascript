import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { DestructiveController } from '../../../blocks/destructive/destructive.controller';
import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileDeleteSectionView } from '../user-profile-delete-section/user-profile-delete-section.view';

function viewProps(overrides: Partial<DestructiveController> = {}): DestructiveController {
  return {
    open: false,
    onOpenChange: vi.fn(),
    onDelete: vi.fn(),
    isDeleting: false,
    errorMessage: undefined,
    openDestructiveDialog: vi.fn(),
    ...overrides,
  };
}

function view(props: DestructiveController) {
  return (
    <MosaicProvider>
      <UserProfileDeleteSectionView {...props} />
    </MosaicProvider>
  );
}

function renderView(overrides: Partial<DestructiveController> = {}) {
  const props = viewProps(overrides);
  return { ...render(view(props)), props };
}

describe('UserProfileDeleteSectionView', () => {
  it('renders the danger zone and asks to open the dialog', async () => {
    const user = userEvent.setup();
    const { props } = renderView();

    expect(screen.getByRole('heading', { name: 'Danger zone' })).toBeInTheDocument();
    expect(screen.getByText('Delete account', { selector: '.cl-section-label' })).toBeInTheDocument();
    expect(screen.getByText('Permanently delete this account and all its data. This cannot be undone.')).toHaveClass(
      'cl-section-description',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete account' }));
    expect(props.onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('confirms only after the phrase is typed back', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    renderView({ open: true, onDelete });

    const dialog = screen.getByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Delete account' });

    expect(within(dialog).getByText('Type “Delete account” below to continue')).toBeInTheDocument();
    expect(confirm).toHaveAttribute('aria-disabled', 'true');

    await user.type(within(dialog).getByRole('textbox'), 'Delete account');
    await user.click(confirm);

    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('renders a delete failure while keeping the dialog open', () => {
    renderView({ open: true, errorMessage: 'Your subscription is still active.' });

    expect(screen.getByText('Your subscription is still active.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('clears the phrase when the dialog is cancelled', async () => {
    const user = userEvent.setup();
    const props = viewProps({ open: true });
    const { rerender } = render(view(props));

    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByRole('textbox'), 'Delete account');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(props.onOpenChange).toHaveBeenCalledWith(false, expect.anything());
    rerender(view({ ...props, open: false }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    rerender(view({ ...props, open: true }));
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});
