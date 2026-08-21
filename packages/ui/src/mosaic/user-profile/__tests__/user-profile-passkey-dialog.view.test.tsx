import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { AlertDialog } from '../../components/alert-dialog';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
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
        <PasskeyDialog>
          <UserProfilePasskeyAddDialogView
            state={{ isSubmitting: false, errors: {} }}
            onAdd={onAdd}
            onCancel={vi.fn()}
          />
        </PasskeyDialog>
      </MosaicProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Add passkey' }));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('announces passkey creation failures and pending state', () => {
    render(
      <MosaicProvider>
        <PasskeyDialog>
          <UserProfilePasskeyAddDialogView
            state={{ isSubmitting: true, errors: { form: 'Passkey creation was canceled.' } }}
            onAdd={vi.fn()}
            onCancel={vi.fn()}
          />
        </PasskeyDialog>
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
        <PasskeyDialog>
          <UserProfilePasskeyRenameDialogView
            state={{ id: 'passkey', originalName: 'Passkey', name: 'Passkey', isSubmitting: false, errors: {} }}
            onCancel={vi.fn()}
            onNameChange={onNameChange}
            onRename={onRename}
          />
        </PasskeyDialog>
      </MosaicProvider>,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    view.rerender(
      <MosaicProvider>
        <PasskeyDialog>
          <UserProfilePasskeyRenameDialogView
            state={{ id: 'passkey', originalName: 'Passkey', name: 'Chrome on macOS', isSubmitting: false, errors: {} }}
            onCancel={vi.fn()}
            onNameChange={onNameChange}
            onRename={onRename}
          />
        </PasskeyDialog>
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
        <AlertDialog open>
          <UserProfilePasskeyRemoveDialogView
            state={{ id: 'passkey', name: 'Chrome on macOS', isSubmitting: false, errors: {} }}
            onCancel={vi.fn()}
            onRemove={onRemove}
          />
        </AlertDialog>
      </MosaicProvider>,
    );

    const dialog = screen.getByRole('alertdialog', { name: 'Remove passkey' });
    expect(dialog).toHaveAccessibleDescription('Chrome on macOS will be removed from this account.');
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});

function PasskeyDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup
            render={
              <Card.Root
                elevation='overlay'
                renderBranding={false}
              />
            }
          >
            {children}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
