import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { UserProfileMfaSetupViewProps } from '../user-profile-mfa-setup.view';
import { MfaSetupDialog } from './mfa-test-utils';

type ViewProps = UserProfileMfaSetupViewProps['backupCodes'];

const codes = ['pwkkay19', 'cvgunlqs', '4czio578', 'a38eewtw', 'qqnwzvyr', 'znq8j16s'];

function renderView(overrides: Partial<ViewProps> = {}, step: UserProfileMfaSetupViewProps['step'] = 'backup-codes') {
  const props: ViewProps = {
    codes,
    onRetry: vi.fn(),
    onCopy: vi.fn(),
    onDownload: vi.fn(),
    ...overrides,
  };
  return {
    props,
    ...render(
      <MfaSetupDialog
        step={step}
        backupCodes={props}
      />,
    ),
  };
}

describe('UserProfileBackupCodesView', () => {
  it.each([
    { codes, action: 'Copy and close' },
    { codes: [], action: 'Try again' },
  ])('focuses $action when entering backup codes', async ({ codes, action }) => {
    const { props, rerender } = renderView({ codes }, 'select');
    rerender(
      <MfaSetupDialog
        step='backup-codes'
        backupCodes={props}
      />,
    );
    const button = screen.getByRole('button', { name: action });
    await waitFor(() => expect(document.activeElement === button).toBe(true), { timeout: 1000 });
  });

  it('keeps the default focus while generating codes', async () => {
    renderView({ codes: [], pendingAction: 'generate' });
    const close = screen.getByRole('button', { name: 'Close' });
    await waitFor(() => expect(document.activeElement === close).toBe(true), { timeout: 1000 });
  });

  it('retries failed generation without offering empty codes to save', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderView({ codes: [], pendingAction: 'generate' });
    expect(screen.getByRole('progressbar', { name: 'Generating backup codes' })).toBeInTheDocument();
    const loading = screen.getByRole('status', { name: 'Generating backup codes' });
    expect(loading.textContent).toBe('');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy and close' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Download', exact: true })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(props.onRetry).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    rerender(
      <MfaSetupDialog
        step='backup-codes'
        backupCodes={{
          ...props,
          pendingAction: undefined,
          errorMessage: 'Unable to generate backup codes. Please try again.',
        }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to generate backup codes. Please try again.');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  it('returns to method selection when generation fails after choosing backup codes', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderView({ codes: [], errorMessage: 'Unable to generate backup codes.', onBack });
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledOnce();
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
        <MfaSetupDialog
          step='backup-codes'
          backupCodes={{
            ...props,
            pendingAction: undefined,
            errorMessage: 'Unable to save your backup codes. Please try again.',
          }}
        />,
      );
      expect(screen.getByRole('dialog')).toBe(dialog);
      expect(screen.getByRole('alert')).toHaveTextContent('Unable to save your backup codes. Please try again.');
      expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual(codes);
      await user.click(button);
      expect(action === 'copy' ? props.onCopy : props.onDownload).toHaveBeenCalledTimes(1);
    },
  );
});
