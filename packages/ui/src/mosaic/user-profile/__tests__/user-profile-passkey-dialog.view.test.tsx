import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import {
  UserProfilePasskeyAddDialogView,
  UserProfilePasskeyRemoveDialogView,
  UserProfilePasskeyRenameDialogView,
} from '../user-profile-passkey-dialog.view';

describe('passkey dialog views', () => {
  it('submits passkey creation from the dialog', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <UserProfilePasskeyAddDialogView
          open
          state={{ isSubmitting: false, errors: {} }}
          onAdd={onAdd}
        />
      </MosaicProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('announces passkey creation failures and pending state', () => {
    render(
      <MosaicProvider>
        <UserProfilePasskeyAddDialogView
          open
          state={{ isSubmitting: true, errors: { form: 'Passkey creation was canceled.' } }}
          onAdd={vi.fn()}
        />
      </MosaicProvider>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Add passkey' });
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Passkey creation was canceled.');
    expect(within(dialog).getByRole('button', { name: 'Add passkey' })).toHaveAttribute('aria-busy', 'true');
  });

  it('only submits a changed passkey name', async () => {
    const onNameChange = vi.fn();
    const onRename = vi.fn();
    const user = userEvent.setup();
    const view = render(
      <MosaicProvider>
        <UserProfilePasskeyRenameDialogView
          open
          state={{ id: 'passkey', originalName: 'Passkey', name: 'Passkey', isSubmitting: false, errors: {} }}
          onNameChange={onNameChange}
          onRename={onRename}
        />
      </MosaicProvider>,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    view.rerender(
      <MosaicProvider>
        <UserProfilePasskeyRenameDialogView
          open
          state={{ id: 'passkey', originalName: 'Passkey', name: 'Chrome on macOS', isSubmitting: false, errors: {} }}
          onNameChange={onNameChange}
          onRename={onRename}
        />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onRename).toHaveBeenCalledOnce();
  });

  it('confirms passkey removal', async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <UserProfilePasskeyRemoveDialogView
          open
          state={{ id: 'passkey', name: 'Chrome on macOS', isSubmitting: false, errors: {} }}
          onRemove={onRemove}
        />
      </MosaicProvider>,
    );

    const dialog = screen.getByRole('alertdialog', { name: 'Remove passkey' });
    expect(dialog).toHaveAccessibleDescription('Chrome on macOS will be removed from this account.');
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
