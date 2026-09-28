import { describe, expect, it } from 'vitest';

import { projectWeb3Wallets } from './user-profile-web3-wallets-section.model';

const metamask = {
  id: 'wallet_metamask',
  address: '0x1234567890abcdef',
  strategy: 'web3_metamask_signature',
  status: 'verified',
};

describe('Web3 wallet projection', () => {
  it('WEB3-01 shows configured providers that do not have a verified wallet', () => {
    expect(
      projectWeb3Wallets({
        wallets: [metamask],
        primaryId: null,
        enabledStrategies: ['web3_metamask_signature', 'web3_coinbase_wallet_signature'],
        allowCreation: true,
      }),
    ).toMatchObject({
      status: 'ready',
      availableProviders: [{ id: 'web3_coinbase_wallet_signature', provider: 'Coinbase Wallet' }],
    });
  });

  it('WEB3-02 keeps unverified wallets and their provider available', () => {
    const result = projectWeb3Wallets({
      wallets: [{ ...metamask, status: 'unverified' }],
      primaryId: null,
      enabledStrategies: ['web3_metamask_signature'],
      allowCreation: true,
    });
    expect(result).toMatchObject({
      wallets: [{ id: 'wallet_metamask', provider: 'MetaMask', isVerified: false }],
      availableProviders: [{ id: 'web3_metamask_signature' }],
    });
  });

  it('WEB3-03 shows admin wallets without a provider and filters unknown strategies', () => {
    const result = projectWeb3Wallets({
      wallets: [
        { id: 'admin', address: '0xadmin', strategy: 'admin', status: 'verified' },
        { id: 'unknown', address: '0xunknown', strategy: 'unknown', status: 'verified' },
      ],
      primaryId: null,
      enabledStrategies: [],
      allowCreation: false,
    });
    expect(result).toMatchObject({ status: 'ready', wallets: [{ id: 'admin', address: '0xadmin' }] });
    if (result.status === 'ready') {
      expect(result.wallets[0].provider).toBeUndefined();
    }
  });

  it('WEB3-04 orders primary, verified, then unverified wallets', () => {
    const result = projectWeb3Wallets({
      wallets: [
        { ...metamask, id: 'unverified', status: 'unverified', expireAt: new Date('2026-01-02') },
        { ...metamask, id: 'verified_z' },
        { ...metamask, id: 'verified_a' },
        { ...metamask, id: 'primary' },
      ],
      primaryId: 'primary',
      enabledStrategies: ['web3_metamask_signature'],
      allowCreation: false,
    });
    expect(result.status).toBe('ready');
    if (result.status === 'ready') {
      expect(result.wallets.map(wallet => wallet.id)).toEqual(['primary', 'verified_a', 'verified_z', 'unverified']);
      expect(result.availableProviders).toEqual([]);
    }
  });

  it('WEB3-04 keeps wallets without a verification status after expiring unverified wallets', () => {
    const result = projectWeb3Wallets({
      wallets: [
        { ...metamask, id: 'missing', status: null },
        { ...metamask, id: 'unverified_without_expiry', status: 'unverified' },
        { ...metamask, id: 'unverified_with_expiry', status: 'unverified', expireAt: new Date('2026-01-02') },
      ],
      primaryId: null,
      enabledStrategies: [],
      allowCreation: false,
    });
    expect(result.status).toBe('ready');
    if (result.status === 'ready') {
      expect(result.wallets.map(wallet => wallet.id)).toEqual([
        'unverified_without_expiry',
        'unverified_with_expiry',
        'missing',
      ]);
    }
  });

  it('WEB3-05 hides the section without creation or existing wallets', () => {
    expect(projectWeb3Wallets({ wallets: [], primaryId: null, enabledStrategies: [], allowCreation: false })).toEqual({
      status: 'hidden',
    });
  });
});
