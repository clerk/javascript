import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

import { deferred } from '../../../../__tests__/async';
import { serveFapi } from '../../../../__tests__/feature/fake-fapi';
import { openMenu } from '../../../../__tests__/feature/menu';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { UserProfileWeb3WalletsSection } from '../user-profile-web3-wallets-section';
import { registerWallets, signedInWallets } from './user-profile-web3-wallets.fixtures';

const account = {
  address: 'SolanaRecoveryAccount',
  publicKey: new Uint8Array([1, 2, 3]),
  chains: ['solana:mainnet' as const],
  features: ['solana:signMessage' as const],
};
const signatures = [{ signature: new Uint8Array([4, 5, 6]) }];

function registerSolana(
  connect: () => Promise<{ accounts: (typeof account)[] }>,
  signMessage: () => Promise<typeof signatures>,
) {
  return registerWallets({
    version: '1.0.0',
    name: 'Recovery Solana',
    icon: 'data:image/svg+xml;base64,',
    chains: ['solana:mainnet'],
    accounts: [account],
    features: {
      'standard:connect': { version: '1.0.0', connect },
      'solana:signMessage': { version: '1.0.0', signMessage },
    },
  });
}

it('explains Solana connection cancellation and connects on retry', async () => {
  const connect = vi
    .fn()
    .mockRejectedValueOnce({ code: 4001 })
    .mockResolvedValue({ accounts: [account] });
  const unregister = registerSolana(connect, () => Promise.resolve(signatures));
  try {
    const fapi = serveFapi(signedInWallets(['web3_solana_signature']));
    await renderWithClerk(<UserProfileWeb3WalletsSection />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Connect Solana' }));
    await user.click(await screen.findByRole('button', { name: 'Recovery Solana' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Wallet connection was cancelled. Please try again.'),
    );
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Recovery Solana' }));
    await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'));
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  } finally {
    unregister();
  }
});

it.each([
  ['connect', 'resolve'],
  ['connect', 'reject'],
  ['signMessage', 'resolve'],
  ['signMessage', 'reject'],
] as const)('ignores abandoned Solana %s %s and verifies after reopening', async (stage, outcome) => {
  const oldConnection = deferred<{ accounts: (typeof account)[] }>();
  const nextConnection = deferred<{ accounts: (typeof account)[] }>();
  const oldSignature = deferred<typeof signatures>();
  const nextSignature = deferred<typeof signatures>();
  const connect = vi.fn(() => (stage === 'connect' ? oldConnection.promise : Promise.resolve({ accounts: [account] })));
  const signMessage = vi.fn(() => (stage === 'signMessage' ? oldSignature.promise : Promise.resolve(signatures)));
  const unregister = registerSolana(connect, signMessage);
  try {
    const fapi = serveFapi(signedInWallets(['web3_solana_signature']));
    const view = await renderWithClerk(<UserProfileWeb3WalletsSection />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Connect Solana' }));
    await user.click(await screen.findByRole('button', { name: 'Recovery Solana' }));
    await waitFor(() => expect(stage === 'connect' ? connect : signMessage).toHaveBeenCalledTimes(1));
    view.rerender(<div />);
    view.rerender(<UserProfileWeb3WalletsSection />);
    connect.mockImplementation(() =>
      stage === 'connect' ? nextConnection.promise : Promise.resolve({ accounts: [account] }),
    );
    signMessage.mockImplementation(() =>
      stage === 'signMessage' ? nextSignature.promise : Promise.resolve(signatures),
    );
    if (stage === 'signMessage') {
      await openMenu(user, await screen.findByRole('button', { name: 'Manage Solana' }));
      await user.click(screen.getByRole('menuitem', { name: 'Verify' }));
    } else {
      await user.click(await screen.findByRole('button', { name: 'Connect Solana' }));
    }
    await user.click(await screen.findByRole('button', { name: 'Recovery Solana' }));
    await waitFor(() => expect(stage === 'connect' ? connect : signMessage).toHaveBeenCalledTimes(2));
    await act(() => {
      if (outcome === 'reject') {
        (stage === 'connect' ? oldConnection : oldSignature).reject(new Error('User rejected the request.'));
      } else if (stage === 'connect') {
        oldConnection.resolve({ accounts: [account] });
      } else {
        oldSignature.resolve(signatures);
      }
    });
    expect(screen.getByRole('alert')).toHaveTextContent(/^$/);
    expect(screen.getByRole('button', { name: 'Recovery Solana' })).toHaveAttribute('aria-disabled', 'true');
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(stage === 'connect' ? 0 : 1);
    expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).not.toBe('verified');
    await act(() => {
      if (stage === 'connect') {
        nextConnection.resolve({ accounts: [account] });
      } else {
        nextSignature.resolve(signatures);
      }
    });
    await waitFor(() => expect(fapi.client.sessions[0]?.user.web3_wallets[0]?.verification?.status).toBe('verified'));
    expect(fapi.client.sessions[0]?.user.web3_wallets).toHaveLength(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  } finally {
    unregister();
  }
});
