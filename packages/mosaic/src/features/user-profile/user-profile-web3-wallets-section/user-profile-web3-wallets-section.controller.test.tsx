import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../__tests__/async';
import { useUserProfileWeb3WalletsController } from './user-profile-web3-wallets-section.controller';
import type {
  ReadyWeb3WalletsModel,
  UserProfileWeb3Provider,
  UserProfileWeb3Wallet,
} from './user-profile-web3-wallets-section.types';

const providers = [
  { id: 'web3_metamask_signature', provider: 'MetaMask' },
  { id: 'web3_base_signature', provider: 'Base' },
  { id: 'web3_coinbase_wallet_signature', provider: 'Coinbase Wallet' },
  { id: 'web3_okx_wallet_signature', provider: 'OKX Wallet' },
  { id: 'web3_solana_signature', provider: 'Solana', walletPicker: 'solana' },
] satisfies UserProfileWeb3Provider[];

describe('Web3 connection controller', () => {
  it('does not move an address-phase connection to a different provider with the same address', async () => {
    const pending = deferred<void>();
    const connect = vi.fn<ReadyWeb3WalletsModel['connect']>((_strategy, _name, onTarget) => {
      onTarget?.({ kind: 'address', address: '0xabcd' });
      return pending.promise;
    });
    const { result } = renderHook(() =>
      useUserProfileWeb3WalletsController({
        wallets: [
          {
            id: 'coinbase',
            address: '0xAbCd',
            providerId: 'web3_coinbase_wallet_signature',
            isVerified: true,
          },
        ],
        availableProviders: [providers[0]],
        connect,
        verify: vi.fn(),
        setPrimary: vi.fn(),
        remove: vi.fn(),
      }),
    );

    act(() => {
      void result.current.onConnect('web3_metamask_signature');
    });
    expect(result.current.pendingId).toBe('web3_metamask_signature');
    await act(async () => {
      pending.reject(new Error('Rejected'));
      await pending.promise.catch(() => undefined);
    });
    expect(result.current.wallets[0]?.primaryError).toBeUndefined();
    expect(result.current.availableProviders[0]?.connectError).toBe('Something went wrong. Please try again.');
  });

  it('does not move a later primary update to the previous connection target', async () => {
    const connect = vi.fn<ReadyWeb3WalletsModel['connect']>(async (_strategy, _name, onTarget) => {
      onTarget?.({ kind: 'wallet', id: 'target' });
      throw new Error('Signature rejected');
    });
    const primary = deferred<void>();
    const setPrimary = vi.fn(() => primary.promise);
    const { result } = renderHook(() =>
      useUserProfileWeb3WalletsController({
        wallets: [
          { id: 'target', address: '0x1234', isVerified: false, canVerify: true },
          { id: 'other', address: '0xabcd', isVerified: true },
        ],
        availableProviders: [providers[0]],
        connect,
        verify: vi.fn(),
        setPrimary,
        remove: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.onConnect('web3_metamask_signature');
    });
    expect(result.current.wallets[0]?.verifyError).toBe('Something went wrong. Please try again.');
    act(() => {
      void result.current.onSetPrimary('other');
    });
    expect(result.current.pendingId).toBe('other');
    await act(async () => {
      primary.reject(new Error('Primary rejected'));
      await primary.promise.catch(() => undefined);
    });
    expect(result.current.wallets[1]?.primaryError).toBe('Something went wrong. Please try again.');
    expect(result.current.wallets[0]?.verifyError).toBeUndefined();
  });

  it.each(providers)('moves pending and failure to the exact published $provider wallet', async provider => {
    const signature = deferred<void>();
    let reportTarget: Parameters<ReadyWeb3WalletsModel['connect']>[2];
    const connect = vi.fn<ReadyWeb3WalletsModel['connect']>((_strategy, _walletName, onTarget) => {
      reportTarget = onTarget;
      return signature.promise;
    });
    const address = provider.walletPicker === 'solana' ? 'SolanaAbCd' : '0xAbCd';
    const otherAddress = provider.walletPicker === 'solana' ? 'Solanaabcd' : '0x1234';
    const wallets: UserProfileWeb3Wallet[] = [
      { id: 'other', address: otherAddress, isVerified: false, canVerify: true },
      { id: 'target', address, providerId: provider.id, isVerified: false, canVerify: true },
    ];
    const { result } = renderHook(() =>
      useUserProfileWeb3WalletsController({
        wallets,
        availableProviders: [provider],
        connect,
        verify: vi.fn(),
        setPrimary: vi.fn(),
        remove: vi.fn(),
      }),
    );

    await act(async () => {
      const connection = result.current.onConnect(provider.id);
      if (provider.walletPicker === 'solana') {
        await connection;
      }
    });
    if (provider.walletPicker === 'solana') {
      act(() => {
        void result.current.connectSolana('Selected Solana');
      });
      act(() => {
        void result.current.connectSolana('Ignored Solana');
      });
      expect(result.current.pendingWalletName).toBe('Selected Solana');
    }
    expect(connect).toHaveBeenCalledOnce();
    act(() => {
      reportTarget?.({
        kind: 'address',
        address: provider.walletPicker === 'solana' ? address : address.toLowerCase(),
      });
    });
    expect(result.current.pendingId).toBe('target');
    expect(result.current.wallets.map(wallet => wallet.id)).toEqual(['other', 'target']);

    act(() => reportTarget?.({ kind: 'wallet', id: 'target' }));
    expect(result.current.wallets.map(wallet => wallet.id)).toEqual(['other', 'target']);

    await act(async () => {
      signature.reject(new Error('Signature rejected'));
      await signature.promise.catch(() => undefined);
    });
    expect(result.current.wallets.map(wallet => wallet.id)).toEqual(['other', 'target']);
    expect(result.current.pendingId).toBeUndefined();
    expect(result.current.wallets[1]?.verifyError).toBe('Something went wrong. Please try again.');
    expect(result.current.wallets[0]?.verifyError).toBeUndefined();
  });
});
