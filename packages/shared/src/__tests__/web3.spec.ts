import { describe, expect, it } from 'vitest';

import { isSolanaSignInWallet } from '../web3';

describe('isSolanaSignInWallet', () => {
  it.each([
    { chains: ['solana:mainnet'], features: { 'standard:connect': {}, 'solana:signMessage': {} }, eligible: true },
    { chains: ['solana:mainnet'], features: { 'solana:signMessage': {} }, eligible: false },
    { chains: ['solana:mainnet'], features: { 'standard:connect': {} }, eligible: false },
    { chains: ['eip155:1'], features: { 'standard:connect': {}, 'solana:signMessage': {} }, eligible: false },
    { chains: [], features: { 'standard:connect': {}, 'solana:signMessage': {} }, eligible: false },
  ] as const)('requires a Solana chain and both sign-in capabilities for $chains and $features', wallet => {
    expect(isSolanaSignInWallet(wallet)).toBe(wallet.eligible);
  });
});
