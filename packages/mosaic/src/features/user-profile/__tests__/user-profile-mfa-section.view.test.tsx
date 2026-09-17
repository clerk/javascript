import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../machines/__tests__/test-utils';
import { MosaicProvider } from '../../../MosaicProvider';
import type { UserProfileMfaMethod, UserProfileMfaSectionViewProps } from '../user-profile-mfa-section.view';
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

  it.each(['authenticator', 'sms'] as const)('displays the supplied default state for %s', type => {
    const { props, rerender } = renderView({ methods: [{ id: 'method_1', type, isDefault: true }] });

    expect(screen.getByText('Default')).toBeVisible();

    rerender(
      <MosaicProvider>
        <UserProfileMfaSectionView
          {...props}
          methods={[{ id: 'method_1', type, isDefault: false }]}
        />
      </MosaicProvider>,
    );

    expect(screen.queryByText('Default')).not.toBeInTheDocument();
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

  it.each(['{Enter}', ' '])('activates a method with %s', async key => {
    const user = userEvent.setup();
    const { props } = renderView();
    const add = screen.getByRole('button', { name: 'Add verification method' });
    await user.click(add);
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: /Authenticator app Get codes/ })).toHaveFocus();
    await user.keyboard(key);

    expect(props.onAdd).toHaveBeenCalledExactlyOnceWith('authenticator');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(add).toHaveFocus();
  });

  it('offers only caller-supplied methods, including a second SMS method', async () => {
    const user = userEvent.setup();
    const { props } = renderView({
      methods: [{ id: 'existing', type: 'sms' }],
      addableMethods: ['sms'],
    });
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    expect(screen.queryByRole('button', { name: /Authenticator app/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Backup codes/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /SMS verification Get a code/ }));
    expect(props.onAdd).toHaveBeenCalledExactlyOnceWith('sms');
  });

  it.each([[], undefined])('keeps the section visible when addable methods are %s', addableMethods => {
    renderView({ addableMethods });
    expect(screen.getByText('No verification methods added')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add verification method' })).not.toBeInTheDocument();
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

  it('offers Set as default only for an eligible SMS row and reflects updated props', async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderView({
      methods: [
        { id: 'personal', type: 'sms', description: '+1 801-555-0100', isDefault: true },
        { id: 'work', type: 'sms', description: '+1 801-555-0200', canSetDefault: true },
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Manage SMS verification +1 801-555-0100' }));
    expect(screen.queryByRole('menuitem', { name: 'Set as default' })).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Manage SMS verification +1 801-555-0200' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as default' }));

    expect(props.onSetDefault).toHaveBeenCalledExactlyOnceWith('work');

    rerender(
      <MosaicProvider>
        <UserProfileMfaSectionView
          {...props}
          methods={[
            { id: 'personal', type: 'sms', description: '+1 801-555-0100', canSetDefault: true },
            { id: 'work', type: 'sms', description: '+1 801-555-0200', isDefault: true },
          ]}
        />
      </MosaicProvider>,
    );

    expect(screen.getAllByText('Default')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Manage SMS verification +1 801-555-0200' }));
    expect(screen.queryByRole('menuitem', { name: 'Set as default' })).not.toBeInTheDocument();
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

  it('explains authenticator removal without referring to a phone number', async () => {
    const user = userEvent.setup();
    const { props } = renderView({ methods: [{ id: 'totp', type: 'authenticator', isDefault: true }] });

    await user.click(screen.getByRole('button', { name: 'Manage Authenticator app' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Remove authenticator app' });
    expect(dialog).toHaveAccessibleDescription(
      'Verification codes from this authenticator will no longer be required when signing in. Your account may not be as secure.',
    );
    expect(props.onRemove).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: 'Remove', exact: true }));

    expect(props.onRemove).toHaveBeenCalledExactlyOnceWith('totp');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('waits for removal of the final method before showing the empty section', async () => {
    const user = userEvent.setup();
    const pending = deferred<void>();
    const onRemove = vi.fn(() => pending.promise);
    const onAdd = vi.fn();

    function Example() {
      const [methods, setMethods] = useState<UserProfileMfaMethod[]>([{ id: 'totp', type: 'authenticator' }]);
      return (
        <MosaicProvider>
          <UserProfileMfaSectionView
            methods={methods}
            onAdd={onAdd}
            addableMethods={['authenticator']}
            onRemove={async id => {
              await onRemove();
              setMethods(current => current.filter(method => method.id !== id));
            }}
          />
        </MosaicProvider>
      );
    }

    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Manage Authenticator app' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    await user.click(screen.getByRole('button', { name: 'Remove', exact: true }));

    expect(screen.getByRole('button', { name: 'Remove', exact: true })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Authenticator app')).toBeInTheDocument();
    expect(screen.queryByText('No verification methods added')).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    await act(async () => {
      pending.resolve();
      await pending.promise;
    });

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByRole('region', { name: '2-step verification' })).toBeVisible();
    expect(screen.queryByText('Authenticator app')).not.toBeInTheDocument();
    expect(screen.getByText('No verification methods added')).toBeVisible();
    expect(onRemove).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Add verification method' }));
    await user.click(screen.getByRole('button', { name: /Authenticator app Get codes/ }));
    expect(onAdd).toHaveBeenCalledExactlyOnceWith('authenticator');
  });

  it('keeps a failed SMS removal open and retries the same method', async () => {
    const user = userEvent.setup();
    const onRemove = vi
      .fn<(id: string) => Promise<void>>()
      .mockRejectedValueOnce(new Error('Could not remove this method. Please try again.'))
      .mockResolvedValueOnce(undefined);

    function Example() {
      const [methods, setMethods] = useState<UserProfileMfaMethod[]>([
        { id: 'personal', type: 'sms', description: '+1 801-555-0100' },
        { id: 'work', type: 'sms', description: '+1 801-555-0200' },
        { id: 'backup', type: 'backup-codes' },
      ]);
      return (
        <MosaicProvider>
          <UserProfileMfaSectionView
            methods={methods}
            onRemove={async id => {
              await onRemove(id);
              setMethods(current => current.filter(method => method.id !== id));
            }}
          />
        </MosaicProvider>
      );
    }

    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Manage SMS verification +1 801-555-0200' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));
    await user.click(screen.getByRole('button', { name: 'Remove', exact: true }));
    const dialog = screen.getByRole('alertdialog');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Could not remove this method. Please try again.',
    );
    expect(dialog).toHaveAccessibleDescription(
      'You will no longer receive sign-in verification codes at +1 801-555-0200. The phone number will remain on your account.',
    );
    expect(screen.getByText('+1 801-555-0200')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Remove', exact: true }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onRemove.mock.calls).toEqual([['work'], ['work']]);
    expect(screen.queryByText('+1 801-555-0200')).not.toBeInTheDocument();
    expect(screen.getByText('+1 801-555-0100')).toBeVisible();
    expect(screen.getByText('Backup codes')).toBeVisible();
  });

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

  it('keeps rows visible without action callbacks', () => {
    renderView({
      methods: [
        { id: 'totp', type: 'authenticator', isDefault: true },
        { id: 'phone', type: 'sms', description: '+1 801-555-0100', canSetDefault: true },
        { id: 'backup', type: 'backup-codes' },
      ],
      onAdd: undefined,
      onRemove: undefined,
      onSetDefault: undefined,
      onRegenerateBackupCodes: undefined,
    });

    expect(screen.getByText('Authenticator app')).toBeVisible();
    expect(screen.getByText('+1 801-555-0100')).toBeVisible();
    expect(screen.getByText('Backup codes')).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it.each([true, false])('keeps the empty section visible with Add available: %s', canAdd => {
    renderView({ onAdd: canAdd ? vi.fn() : undefined });

    expect(screen.getByRole('region', { name: '2-step verification' })).toBeVisible();
    expect(screen.getByText('No verification methods added')).toBeVisible();
    if (canAdd) {
      expect(screen.getByRole('button', { name: 'Add verification method' })).toBeVisible();
    } else {
      expect(screen.queryByRole('button', { name: 'Add verification method' })).not.toBeInTheDocument();
    }
  });
});
