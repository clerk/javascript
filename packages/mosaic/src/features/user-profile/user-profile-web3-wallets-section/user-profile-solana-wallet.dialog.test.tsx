import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getWallets } from '@wallet-standard/core';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileSolanaWalletDialog } from './user-profile-solana-wallet.dialog';

function renderDialog(pending = false, error?: string) {
  const onOpenChange = vi.fn();
  render(
    <MosaicProvider>
      <UserProfileSolanaWalletDialog
        open
        pending={pending}
        error={error}
        onOpenChange={onOpenChange}
        onConnect={vi.fn()}
      />
    </MosaicProvider>,
  );
  return onOpenChange;
}

describe('Solana wallet picker', () => {
  it.each(['Close', 'Escape'])('closes directly with %s when idle', async control => {
    const user = userEvent.setup();
    const onOpenChange = renderDialog();

    if (control === 'Escape') {
      await user.keyboard('{Escape}');
    } else {
      await user.click(screen.getByRole('button', { name: 'Close' }));
    }

    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('blocks Close and Escape while the wallet provider is pending', async () => {
    const user = userEvent.setup();
    const onOpenChange = renderDialog(true);

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.keyboard('{Escape}');

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('shows a direct connection error in the picker', () => {
    renderDialog(false, 'Wallet connection failed');

    expect(screen.getByRole('alert')).toHaveTextContent('Wallet connection failed');
    expect(screen.getByRole('dialog', { name: 'Select a Solana wallet' })).toBeInTheDocument();
    expect(screen.queryByText('Cannot verify your account')).not.toBeInTheDocument();
  });
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
