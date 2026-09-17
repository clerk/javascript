import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { UserProfileBackupCodesDialogProps } from '../user-profile-backup-codes.dialog';
import { UserProfileBackupCodesDialog } from '../user-profile-backup-codes.dialog';

const codes = ['pwkkay19', 'cvgunlqs', '4czio578', 'a38eewtw', 'qqnwzvyr', 'znq8j16s'];

function renderView(overrides: Partial<UserProfileBackupCodesDialogProps> = {}) {
  const props: UserProfileBackupCodesDialogProps = {
    open: true,
    onOpenChange: vi.fn(),
    codes,
    onRetry: vi.fn(),
    onCopy: vi.fn(),
    onDownload: vi.fn(),
    ...overrides,
  };
  return {
    props,
    ...render(
      <MosaicProvider>
        <UserProfileBackupCodesDialog {...props} />
      </MosaicProvider>,
    ),
  };
}

describe('UserProfileBackupCodesDialog', () => {
  it('returns focus to the caller’s target after completing a flow without a dialog trigger', async () => {
    const user = userEvent.setup();
    function Example() {
      const [open, setOpen] = useState(true);
      const target = useRef<HTMLButtonElement>(null);
      return (
        <MosaicProvider>
          <button
            type='button'
            ref={target}
          >
            Manage verification methods
          </button>
          <UserProfileBackupCodesDialog
            open={open}
            onOpenChange={setOpen}
            finalFocus={target}
            codes={codes}
            onRetry={vi.fn()}
            onDownload={vi.fn()}
            onCopy={() => setOpen(false)}
          />
        </MosaicProvider>
      );
    }
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Copy and close' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage verification methods' })).toHaveFocus());
  });

  it('displays all supplied codes and delegates saving without closing before success', async () => {
    const user = userEvent.setup();
    const { props } = renderView();
    expect(screen.getByRole('dialog', { name: 'Save your backup codes' })).toHaveAccessibleDescription(
      'Save these somewhere safe. Each code can be used once if you lose access to your phone.',
    );
    const list = screen.getByRole('list', { name: 'Backup codes' });
    expect(
      within(list)
        .getAllByRole('listitem')
        .map(item => item.textContent),
    ).toEqual(codes);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Close', exact: true })).toHaveFocus());
    expect(props.onRetry).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Download', exact: true }));
    expect(props.onDownload).toHaveBeenCalledTimes(1);
    expect(props.onOpenChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Copy and close' }));
    expect(props.onCopy).toHaveBeenCalledTimes(1);
    expect(props.onOpenChange).not.toHaveBeenCalled();
  });

  it('retries failed generation without offering empty codes to save', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderView({ codes: [], pendingAction: 'generate' });
    expect(screen.getByRole('progressbar', { name: 'Generating backup codes' })).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy and close' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Download', exact: true })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(props.onRetry).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    rerender(
      <MosaicProvider>
        <UserProfileBackupCodesDialog
          {...props}
          pendingAction={undefined}
          errorMessage='Unable to generate backup codes. Please try again.'
        />
      </MosaicProvider>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to generate backup codes. Please try again.');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['copy', 'Copy and close', 'Download', 'Copying backup codes'],
    ['download', 'Download', 'Copy and close', 'Downloading backup codes'],
  ] as const)(
    'keeps codes available for retry after %s fails and blocks overlapping actions',
    async (action, label, otherLabel, pendingLabel) => {
      const user = userEvent.setup();
      const { props, rerender } = renderView({ pendingAction: action });
      const dialog = screen.getByRole('dialog');
      const button = screen.getByRole('button', { name: label, exact: true });
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('progressbar', { name: pendingLabel })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: otherLabel, exact: true })).toBeDisabled();
      await user.click(button);
      expect(props.onCopy).not.toHaveBeenCalled();
      expect(props.onDownload).not.toHaveBeenCalled();

      rerender(
        <MosaicProvider>
          <UserProfileBackupCodesDialog
            {...props}
            pendingAction={undefined}
            errorMessage='Unable to save your backup codes. Please try again.'
          />
        </MosaicProvider>,
      );
      expect(screen.getByRole('dialog')).toBe(dialog);
      expect(screen.getByRole('alert')).toHaveTextContent('Unable to save your backup codes. Please try again.');
      expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual(codes);
      await user.click(button);
      expect(action === 'copy' ? props.onCopy : props.onDownload).toHaveBeenCalledTimes(1);
    },
  );

  it('replaces old codes during regeneration and renders the newly supplied set', () => {
    const { props, rerender } = renderView();
    rerender(
      <MosaicProvider>
        <UserProfileBackupCodesDialog
          {...props}
          pendingAction='generate'
        />
      </MosaicProvider>,
    );
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Download', exact: true })).not.toBeInTheDocument();

    const replacementCodes = ['newcode1', 'newcode2'];
    rerender(
      <MosaicProvider>
        <UserProfileBackupCodesDialog
          {...props}
          codes={replacementCodes}
        />
      </MosaicProvider>,
    );
    expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual(replacementCodes);
    expect(screen.queryByText(codes[0])).not.toBeInTheDocument();
  });
});
