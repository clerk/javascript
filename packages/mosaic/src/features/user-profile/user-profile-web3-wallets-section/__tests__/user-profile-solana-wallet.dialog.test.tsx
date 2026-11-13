import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../../mosaic-provider';
import { UserProfileSolanaWalletDialog } from '../user-profile-solana-wallet.dialog';

afterEach(() => {
  vi.doUnmock('@wallet-standard/core');
});

describe('Solana wallet discovery failures', () => {
  it('asks for a page refresh after a failed import and lets the user cancel', async () => {
    vi.doMock('@wallet-standard/core', () => {
      throw new Error('Failed to fetch wallet registry');
    });
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <MosaicProvider>
        <UserProfileSolanaWalletDialog
          open
          onOpenChange={onOpenChange}
          onConnect={vi.fn()}
        />
      </MosaicProvider>,
    );
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Wallets could not be loaded. Please refresh the page and try again.',
      ),
    );
    expect(screen.queryByText('No Solana wallets are available.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Retry|Try again/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
