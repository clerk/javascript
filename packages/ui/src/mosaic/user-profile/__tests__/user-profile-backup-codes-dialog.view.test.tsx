import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { UserProfileBackupCodesDialogView } from '../user-profile-backup-codes-dialog.view';

const actions = {
  onGenerate: vi.fn(),
  onCopy: vi.fn(),
  onDownload: vi.fn(),
  onPrint: vi.fn(),
};

describe('UserProfileBackupCodesDialogView', () => {
  it('confirms before regenerating codes', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <UserProfileBackupCodesDialogView
          open
          state={{ step: 'confirm', isSubmitting: false, errors: {} }}
          {...actions}
          onGenerate={onGenerate}
        />
      </MosaicProvider>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Backup codes' });
    expect(dialog).toHaveAccessibleDescription('Regenerating your backup codes invalidates your existing codes.');
    await user.click(within(dialog).getByRole('button', { name: 'Regenerate codes' }));
    expect(onGenerate).toHaveBeenCalledOnce();
  });

  it('shows generation pending and server error states', () => {
    render(
      <MosaicProvider>
        <UserProfileBackupCodesDialogView
          open
          state={{
            step: 'generating',
            isSubmitting: true,
            errors: { form: 'Something went wrong. Please try again.' },
          }}
          {...actions}
        />
      </MosaicProvider>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Generating new backup codes');
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
    expect(screen.getByRole('button', { name: 'Try again' })).toHaveAttribute('aria-busy', 'true');
  });

  it('renders and exposes actions for new backup codes', async () => {
    const onCopy = vi.fn();
    const onDownload = vi.fn();
    const onPrint = vi.fn();
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <UserProfileBackupCodesDialogView
          open
          state={{
            step: 'codes',
            codes: ['3k4p-7m2q', '9w6d-2x8n'],
            copied: false,
            isSubmitting: false,
            errors: {},
          }}
          {...actions}
          onCopy={onCopy}
          onDownload={onDownload}
          onPrint={onPrint}
        />
      </MosaicProvider>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Backup codes' });
    expect(within(dialog).getByText('3k4p-7m2q')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await user.click(screen.getByRole('button', { name: 'Download' }));
    await user.click(screen.getByRole('button', { name: 'Print' }));
    expect(onCopy).toHaveBeenCalledOnce();
    expect(onDownload).toHaveBeenCalledOnce();
    expect(onPrint).toHaveBeenCalledOnce();
  });

  it('reflects copied state', () => {
    render(
      <MosaicProvider>
        <UserProfileBackupCodesDialogView
          open
          state={{ step: 'codes', codes: ['3k4p-7m2q'], copied: true, isSubmitting: false, errors: {} }}
          {...actions}
        />
      </MosaicProvider>,
    );

    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });
});
