import type { Web3WalletJSON } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { BaseResource, Web3Wallet } from '../internal';

describe('Web3 wallet', () => {
  it('create', async () => {
    const web3WalletJSON = {
      object: 'web3_wallet',
      web3_wallet: '0x0000000000000000000000000000000000000000',
    } as Web3WalletJSON;

    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: web3WalletJSON }));

    const web3Wallet = new Web3Wallet(web3WalletJSON, '/me/web3_wallets');
    await web3Wallet.create();

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'POST',
      path: '/me/web3_wallets',
      body: {
        web3_wallet: web3WalletJSON.web3_wallet,
      },
    });
  });

  it('prepareVerification', async () => {
    const web3WalletJSON = {
      id: 'test-id',
      object: 'web3_wallet',
      web3_wallet: '0x0000000000000000000000000000000000000000',
    } as Web3WalletJSON;

    const deferred = createDeferredPromise<any>();
    const mockFetch = vi.fn().mockReturnValue(deferred.promise);
    // @ts-ignore
    BaseResource._fetch = mockFetch;

    const web3Wallet = new Web3Wallet(web3WalletJSON, '/me/web3_wallets');
    const params = { strategy: 'web3_metamask_signature' as const };
    const first = web3Wallet.prepareVerification(params);
    const second = web3Wallet.prepareVerification(params);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith({
      method: 'POST',
      path: `/me/web3_wallets/${web3WalletJSON.id}/prepare_verification`,
      body: {
        strategy: 'web3_metamask_signature',
      },
      signal: expect.any(AbortSignal),
    });

    deferred.resolve({ response: web3WalletJSON });
    await Promise.all([first, second]);
  });

  it('attemptVerification', async () => {
    const web3WalletJSON = {
      id: 'test-id',
      object: 'web3_wallet',
      web3_wallet: '0x0000000000000000000000000000000000000000',
    } as Web3WalletJSON;

    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: web3WalletJSON }));

    const web3Wallet = new Web3Wallet(web3WalletJSON, '/me/web3_wallets');
    await web3Wallet.attemptVerification({ signature: 'mock-signature' });

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'POST',
      path: `/me/web3_wallets/${web3WalletJSON.id}/attempt_verification`,
      body: {
        signature: 'mock-signature',
      },
    });
  });

  it('destroy', async () => {
    const targetId = 'test_id';

    const deletedObjectJSON = {
      object: 'web3_wallet',
      id: targetId,
      deleted: true,
    };

    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: deletedObjectJSON }));

    const web3Wallet = new Web3Wallet({ id: targetId }, '/me/web3_wallets');
    await web3Wallet.destroy();

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'DELETE',
      path: `/me/web3_wallets/${targetId}`,
    });
  });
});
