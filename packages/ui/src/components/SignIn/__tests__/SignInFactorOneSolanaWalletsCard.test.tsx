import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { SignInFactorOneSolanaWalletsCard } from '../SignInFactorOneSolanaWalletsCard';

const { createFixtures } = bindCreateFixtures('SignIn');

// The wallet buttons are lazy-loaded; stub them with a button that invokes the card's
// `web3AuthCallback` so we can assert the params the card forwards to `authenticateWithWeb3`.
vi.mock('@/ui/elements/Web3SolanaWalletButtons', () => ({
  Web3SolanaWalletButtons: ({ web3AuthCallback }: { web3AuthCallback: (a: { walletName: string }) => void }) => (
    <button
      type='button'
      onClick={() => web3AuthCallback({ walletName: 'test-wallet' })}
    >
      Connect Wallet
    </button>
  ),
}));

describe('SignInFactorOneSolanaWalletsCard', () => {
  it('forwards protect-check / second-factor targets relative to the choose-wallet mount', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withSocialProvider({ provider: 'google' });
    });
    fixtures.clerk.authenticateWithWeb3.mockResolvedValueOnce(undefined);

    const { userEvent } = render(<SignInFactorOneSolanaWalletsCard />, { wrapper });

    await userEvent.click(await screen.findByText('Connect Wallet'));

    // This card is mounted at `/sign-in/choose-wallet`, so the gate targets must climb out of
    // `choose-wallet` first — a bare `protect-check` would have resolved to the wrong route.
    await waitFor(() => {
      expect(fixtures.clerk.authenticateWithWeb3).toHaveBeenCalledWith(
        expect.objectContaining({
          strategy: 'web3_solana_signature',
          walletName: 'test-wallet',
          secondFactorUrl: '../factor-two',
          protectCheckUrl: '../protect-check',
        }),
      );
    });
  });
});
