import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useProviderRows } from '../use-provider-rows';

type Wallet = { id: string; providerId?: string };
type Provider = { id: string };

const providerOf = (wallet: Wallet) => wallet.providerId;
const keys = (rows: Array<{ key: string }>) => rows.map(row => row.key);

describe('useProviderRows', () => {
  it('keys the first connected item of a provider by the provider and the rest by their own id', () => {
    const { result } = renderHook(() =>
      useProviderRows<Wallet, Provider>(
        [{ id: 'wallet_1', providerId: 'metamask' }, { id: 'wallet_2', providerId: 'metamask' }, { id: 'wallet_3' }],
        [{ id: 'coinbase' }],
        providerOf,
      ),
    );

    expect(keys(result.current)).toEqual(['metamask', 'wallet_2', 'wallet_3', 'coinbase']);
    expect(result.current[0]?.connected?.id).toBe('wallet_1');
    expect(result.current[3]?.provider?.id).toBe('coinbase');
  });

  it('keeps the offered row where it is when it connects, and when it disconnects again', () => {
    const { result, rerender } = renderHook(
      ({ wallets, providers }: { wallets: Wallet[]; providers: Provider[] }) =>
        useProviderRows(wallets, providers, providerOf),
      { initialProps: { wallets: [{ id: 'wallet_1', providerId: 'metamask' }], providers: [{ id: 'coinbase' }] } },
    );

    rerender({
      wallets: [
        { id: 'wallet_1', providerId: 'metamask' },
        { id: 'wallet_2', providerId: 'coinbase' },
      ],
      providers: [],
    });
    expect(keys(result.current)).toEqual(['metamask', 'coinbase']);
    expect(result.current[1]?.connected?.id).toBe('wallet_2');

    rerender({ wallets: [{ id: 'wallet_2', providerId: 'coinbase' }], providers: [{ id: 'metamask' }] });
    expect(keys(result.current)).toEqual(['metamask', 'coinbase']);
    expect(result.current[0]?.provider?.id).toBe('metamask');
    expect(result.current[1]?.connected?.id).toBe('wallet_2');
  });

  it('leaves an item on its own id while its provider is still offered', () => {
    const { result, rerender } = renderHook(
      ({ wallets, providers }: { wallets: Wallet[]; providers: Provider[] }) =>
        useProviderRows(wallets, providers, providerOf),
      {
        initialProps: { wallets: [{ id: 'wallet_1', providerId: 'metamask' }], providers: [{ id: 'metamask' }] },
      },
    );
    expect(keys(result.current)).toEqual(['wallet_1', 'metamask']);

    rerender({ wallets: [{ id: 'wallet_1', providerId: 'metamask' }], providers: [] });
    expect(keys(result.current)).toEqual(['wallet_1']);
  });
});
