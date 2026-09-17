import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../machines/__tests__/test-utils';
import { MosaicProvider } from '../../../MosaicProvider';
import type { UserProfileMfaSectionViewProps } from '../user-profile-mfa-section.view';
import { UserProfileMfaSectionView } from '../user-profile-mfa-section.view';

function renderView(overrides: Partial<UserProfileMfaSectionViewProps> = {}) {
  const props: UserProfileMfaSectionViewProps = {
    methods: [],
    addableMethods: ['sms', 'authenticator'],
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    onSetDefault: vi.fn(),
    onRegenerateBackupCodes: vi.fn(),
    ...overrides,
  };
  return {
    props,
    ...render(
      <MosaicProvider>
        <UserProfileMfaSectionView {...props} />
      </MosaicProvider>,
    ),
  };
}

describe('MFA section', () => {
  it.each(['sms', 'authenticator'] as const)('continues immediately when the %s option is activated', async type => {
    const user = userEvent.setup();
    const { props } = renderView({
      methods: [{ id: 'existing', type: 'sms', description: '+1 801-555-0100' }],
      addableMethods: ['sms', 'authenticator'],
    });
    const labels = { sms: 'SMS verification', authenticator: 'Authenticator app' };

    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    const dialog = screen.getByRole('dialog', { name: 'Add 2-step verification' });
    expect(dialog).toHaveAccessibleDescription('Choose a verification method');
    expect(within(dialog).queryByRole('button', { name: /Backup codes/ })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: new RegExp(labels[type]) }));

    expect(props.onAdd).toHaveBeenCalledExactlyOnceWith(type);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('+1 801-555-0100')).toBeVisible();
  });

  it('cancels without selecting a method and restores focus to Add', async () => {
    const user = userEvent.setup();
    const { props } = renderView();
    const add = screen.getByRole('button', { name: 'Add verification method' });
    await user.click(add);
    await user.tab();
    expect(screen.getByRole('button', { name: /SMS verification/ })).toHaveFocus();
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(add).toHaveFocus();
    expect(props.onAdd).not.toHaveBeenCalled();
    await user.click(add);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(add).toHaveFocus();
  });

  it('confirms the selected SMS method and restores focus when removal is cancelled', async () => {
    const user = userEvent.setup();
    const { props } = renderView({
      methods: [
        { id: 'totp', type: 'authenticator', isDefault: true, canRemove: false },
        { id: 'personal', type: 'sms', description: '+1 801-555-0100' },
        { id: 'work', type: 'sms', description: '+1 801-555-0200' },
      ],
    });

    expect(screen.getByText('Authenticator app')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Manage Authenticator app' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Manage SMS verification +1 801-555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    expect(screen.getByRole('alertdialog', { name: 'Remove SMS verification' })).toHaveAccessibleDescription(
      'You will no longer receive sign-in verification codes at +1 801-555-0100. The phone number will remain on your account.',
    );
    expect(props.onRemove).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Manage SMS verification +1 801-555-0100' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Manage SMS verification +1 801-555-0200' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Remove SMS verification' });
    expect(dialog).toHaveAccessibleDescription(
      'You will no longer receive sign-in verification codes at +1 801-555-0200. The phone number will remain on your account.',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Remove', exact: true }));

    expect(props.onRemove).toHaveBeenCalledExactlyOnceWith('work');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('marks the selected default change pending and blocks overlapping method actions', async () => {
    const user = userEvent.setup();
    const pending = deferred<void>();
    const onSetDefault = vi.fn(() => pending.promise);
    const { props } = renderView({
      methods: [
        { id: 'personal', type: 'sms', description: '+1 801-555-0100', isDefault: true },
        { id: 'work', type: 'sms', description: '+1 801-555-0200', canSetDefault: true },
        { id: 'other', type: 'sms', description: '+1 801-555-0300', canSetDefault: true },
        { id: 'backup', type: 'backup-codes' },
      ],
      onSetDefault,
    });

    const selected = screen.getByRole('button', { name: 'Manage SMS verification +1 801-555-0200' });
    await user.click(selected);
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));

    expect(selected).toHaveAttribute('aria-busy', 'true');
    expect(selected).toHaveAttribute('aria-disabled', 'true');
    expect(selected).toHaveFocus();
    await user.click(selected);
    await user.keyboard('{Enter}');
    const other = screen.getByRole('button', { name: 'Manage SMS verification +1 801-555-0300' });
    expect(other).toHaveAttribute('aria-disabled', 'true');
    await user.click(other);
    expect(screen.getByRole('button', { name: 'Manage Backup codes' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Add verification method' })).toBeDisabled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getAllByText('Default')).toHaveLength(1);
    expect(onSetDefault).toHaveBeenCalledExactlyOnceWith('work');
    expect(props.onRemove).not.toHaveBeenCalled();

    await act(async () => {
      pending.resolve();
      await pending.promise;
    });

    await waitFor(() => expect(selected).not.toHaveAttribute('aria-busy', 'true'));
    expect(other).not.toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Add verification method' })).toBeEnabled();
    await user.click(other);
    expect(screen.getByRole('menuitem', { name: 'Set as default' })).toBeVisible();
  });

  it.each([
    { cause: new Error('Unable to update the default method.'), message: 'Unable to update the default method.' },
    { cause: 'network failure', message: 'Unable to set this method as default. Please try again.' },
  ])(
    'shows a default-change error beside the selected row and clears it on retry: $message',
    async ({ cause, message }) => {
      const user = userEvent.setup();
      const retry = deferred<void>();
      const onSetDefault = vi.fn().mockRejectedValueOnce(cause).mockReturnValueOnce(retry.promise);
      renderView({
        methods: [
          { id: 'personal', type: 'sms', description: '+1 801-555-0100', isDefault: true },
          { id: 'work', type: 'sms', description: '+1 801-555-0200', canSetDefault: true },
        ],
        onSetDefault,
      });

      const selected = screen.getByRole('button', { name: 'Manage SMS verification +1 801-555-0200' });
      await user.click(selected);
      await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));

      expect(await screen.findByRole('alert')).toHaveTextContent(message);
      expect(selected).toHaveAccessibleDescription(message);
      expect(
        screen.getByRole('button', { name: 'Manage SMS verification +1 801-555-0100' }),
      ).not.toHaveAccessibleDescription();
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(screen.getAllByText('Default')).toHaveLength(1);
      await user.click(selected);
      await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(selected).not.toHaveAccessibleDescription();
      expect(selected).toHaveAttribute('aria-busy', 'true');
      await act(async () => {
        retry.resolve();
        await retry.promise;
      });

      await waitFor(() => expect(selected).not.toHaveAttribute('aria-busy', 'true'));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(onSetDefault.mock.calls).toEqual([['work'], ['work']]);
    },
  );

  it('renders supplied backup codes without other methods and only offers regeneration', async () => {
    const user = userEvent.setup();
    const { props } = renderView({ methods: [{ id: 'backup', type: 'backup-codes' }] });

    expect(screen.getByText('Backup codes')).toBeVisible();
    expect(screen.queryByText('No verification methods added')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Manage Backup codes' }));
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    await user.click(screen.getByRole('menuitem', { name: 'Regenerate' }));

    expect(props.onRegenerateBackupCodes).toHaveBeenCalledOnce();
    expect(props.onRemove).not.toHaveBeenCalled();
    expect(props.onSetDefault).not.toHaveBeenCalled();
  });
});
