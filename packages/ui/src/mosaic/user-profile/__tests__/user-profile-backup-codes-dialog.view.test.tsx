import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { MosaicProvider } from '../../MosaicProvider';
import { UserProfileBackupCodesDialogView } from '../user-profile-backup-codes-dialog.view';

const actions = {
  onRetry: vi.fn(),
  onCopyAndClose: vi.fn(),
  onDownload: vi.fn(),
  onPrint: vi.fn(),
};

describe('UserProfileBackupCodesDialogView', () => {
  it('renders the unavailable result', () => {
    render(
      <MosaicProvider>
        <BackupCodesDialog>
          <UserProfileBackupCodesDialogView
            state={{ step: 'unavailable', isSubmitting: false, errors: {} }}
            onCancel={vi.fn()}
            {...actions}
          />
        </BackupCodesDialog>
      </MosaicProvider>,
    );

    expect(screen.getByText('No backup codes are available. Try generating a new set.')).toBeInTheDocument();
  });
  it('opens in the generating state', () => {
    render(
      <MosaicProvider>
        <BackupCodesDialog>
          <UserProfileBackupCodesDialogView
            state={{ step: 'generating', isSubmitting: true, errors: {} }}
            onCancel={vi.fn()}
            {...actions}
          />
        </BackupCodesDialog>
      </MosaicProvider>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Backup codes' });
    expect(dialog).toHaveAccessibleDescription('Creating a new set of backup codes.');
    expect(within(dialog).getByRole('status')).toHaveTextContent('Generating new backup codes');
  });

  it('announces generation errors and retries', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <BackupCodesDialog>
          <UserProfileBackupCodesDialogView
            state={{
              step: 'generating',
              isSubmitting: false,
              errors: { form: 'Something went wrong. Please try again.' },
            }}
            onCancel={vi.fn()}
            {...actions}
            onRetry={onRetry}
          />
        </BackupCodesDialog>
      </MosaicProvider>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders download, print, and copy-and-close actions for new backup codes', async () => {
    const onCopyAndClose = vi.fn();
    const onDownload = vi.fn();
    const onPrint = vi.fn();
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <BackupCodesDialog>
          <UserProfileBackupCodesDialogView
            state={{
              step: 'codes',
              codes: ['3k4p-7m2q', '9w6d-2x8n'],
              isSubmitting: false,
              errors: {},
            }}
            onCancel={vi.fn()}
            {...actions}
            onCopyAndClose={onCopyAndClose}
            onDownload={onDownload}
            onPrint={onPrint}
          />
        </BackupCodesDialog>
      </MosaicProvider>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Backup codes' });
    expect(within(dialog).getByText('3k4p-7m2q')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Download' }));
    await user.click(screen.getByRole('button', { name: 'Print' }));
    await user.click(screen.getByRole('button', { name: 'Copy and close' }));
    expect(onDownload).toHaveBeenCalledOnce();
    expect(onPrint).toHaveBeenCalledOnce();
    expect(onCopyAndClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Done' })).not.toBeInTheDocument();
  });
});

function BackupCodesDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog.Root
      size='card'
      open
    >
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
