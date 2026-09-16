import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { UserProfileMfaSectionViewProps } from '../user-profile-mfa-section.view';
import { UserProfileMfaSectionView } from '../user-profile-mfa-section.view';

function renderView(overrides: Partial<UserProfileMfaSectionViewProps> = {}) {
  const props: UserProfileMfaSectionViewProps = {
    methods: [],
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

  it('keeps a protected method visible while removing a different SMS method by identity', async () => {
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
    expect(screen.getByRole('button', { name: 'Manage SMS verification +1 801-555-0100' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Manage SMS verification +1 801-555-0200' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove method' }));

    expect(props.onRemove).toHaveBeenCalledExactlyOnceWith('work');
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
