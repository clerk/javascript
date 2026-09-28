import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getWallets } from '@wallet-standard/core';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { ReverificationController } from '../../reverification';
import { UserProfileSolanaWalletDialog } from './user-profile-solana-wallet.dialog';

function renderDialog(reverification: ReverificationController, pending = true) {
  const onOpenChange = vi.fn();
  const view = render(
    <MosaicProvider>
      <UserProfileSolanaWalletDialog
        open
        pending={pending}
        onOpenChange={onOpenChange}
        onConnect={vi.fn()}
        reverification={reverification}
      />
    </MosaicProvider>,
  );
  return { ...view, onOpenChange };
}

describe('Solana wallet reverification', () => {
  it('keeps the picker visible while verification loads', () => {
    renderDialog({ status: 'loading', phase: 'active' });
    expect(screen.getByText(/No Solana wallets are available/)).toBeInTheDocument();
    expect(screen.queryByText('Cannot verify your account')).not.toBeInTheDocument();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it.each(['Back', 'Close', 'Escape'])(
    'returns to the picker when verification is cancelled with %s',
    async control => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      const { onOpenChange } = renderDialog({ status: 'unavailable', phase: 'active', onCancel });
      expect(screen.getByText('Cannot verify your account')).toBeInTheDocument();
      expect(screen.getAllByRole('dialog')).toHaveLength(1);
      if (control === 'Escape') {
        await user.keyboard('{Escape}');
      } else {
        await user.click(screen.getByRole('button', { name: control, exact: true }));
      }
      expect(onCancel).toHaveBeenCalledOnce();
      expect(onOpenChange).not.toHaveBeenCalled();
    },
  );

  it('blocks dismissal while the protected operation retries', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const { onOpenChange } = renderDialog({ status: 'unavailable', phase: 'retrying', onCancel });
    expect(screen.getByRole('button', { name: 'Back', exact: true })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Close', exact: true }));
    await user.keyboard('{Escape}');
    expect(onCancel).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('blocks dismissal while waiting for the wallet provider', async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderDialog({ status: 'idle', phase: 'inactive' });
    await user.click(screen.getByRole('button', { name: 'Close', exact: true }));
    await user.keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

it('returns focus to the selected wallet after cancelling verification', async () => {
  const unregister = getWallets().register({
    version: '1.0.0',
    name: 'Test Solana wallet',
    icon: 'data:image/svg+xml;base64,',
    chains: ['solana:mainnet'],
    accounts: [],
    features: { 'solana:signMessage': {} },
  });
  const user = userEvent.setup();
  function Harness() {
    const [active, setActive] = useState(false);
    return (
      <UserProfileSolanaWalletDialog
        open
        pending={active}
        onOpenChange={vi.fn()}
        onConnect={() => setActive(true)}
        reverification={
          active
            ? { status: 'unavailable', phase: 'active', onCancel: () => setActive(false) }
            : { status: 'idle', phase: 'inactive' }
        }
      />
    );
  }
  try {
    render(
      <MosaicProvider>
        <Harness />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Test Solana wallet' }));
    expect(screen.getByText('Cannot verify your account')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Test Solana wallet', hidden: true })).not.toBeInTheDocument(),
    );
    await user.click(screen.getByRole('button', { name: 'Back', exact: true }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Test Solana wallet' })).toHaveFocus());
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  } finally {
    unregister();
  }
});

it('shows loading only on the selected wallet and disables both choices until it settles', async () => {
  const unregister = getWallets().register(
    ...['First Solana wallet', 'Second Solana wallet'].map(name => ({
      version: '1.0.0' as const,
      name,
      icon: 'data:image/svg+xml;base64,' as const,
      chains: ['solana:mainnet' as const],
      accounts: [],
      features: { 'solana:signMessage': {} },
    })),
  );
  const user = userEvent.setup();
  const onConnect = vi.fn();
  function Harness() {
    const [pending, setPending] = useState(false);
    return (
      <>
        <button
          type='button'
          onClick={() => setPending(false)}
        >
          Finish connection
        </button>
        <UserProfileSolanaWalletDialog
          open
          pending={pending}
          onOpenChange={vi.fn()}
          onConnect={name => {
            onConnect(name);
            setPending(true);
          }}
        />
      </>
    );
  }
  try {
    render(
      <MosaicProvider>
        <Harness />
      </MosaicProvider>,
    );
    const first = screen.getByRole('button', { name: 'First Solana wallet' });
    const second = screen.getByRole('button', { name: 'Second Solana wallet' });
    await user.click(first);
    expect(first).toHaveAttribute('aria-busy', 'true');
    expect(second).not.toHaveAttribute('aria-busy', 'true');
    expect(first).toBeDisabled();
    expect(second).toBeDisabled();
    await user.click(second);
    expect(onConnect).toHaveBeenCalledExactlyOnceWith('First Solana wallet');
    await user.click(screen.getByText('Finish connection'));
    expect(first).not.toHaveAttribute('aria-busy', 'true');
    expect(second).not.toHaveAttribute('aria-busy', 'true');
    expect(first).toBeEnabled();
    expect(second).toBeEnabled();
    await user.click(second);
    expect(first).not.toHaveAttribute('aria-busy', 'true');
    expect(second).toHaveAttribute('aria-busy', 'true');
    expect(first).toBeDisabled();
    expect(second).toBeDisabled();
    expect(onConnect).toHaveBeenLastCalledWith('Second Solana wallet');
  } finally {
    unregister();
  }
});
