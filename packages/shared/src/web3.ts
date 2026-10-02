import type { Web3ProviderData } from './types';

export function isSolanaSignInWallet(wallet: {
  chains: readonly string[];
  features: Readonly<Record<string, unknown>>;
}): boolean {
  return (
    wallet.chains.some(chain => chain.startsWith('solana:')) &&
    'standard:connect' in wallet.features &&
    'solana:signMessage' in wallet.features
  );
}

export const WEB3_PROVIDERS: Web3ProviderData[] = [
  {
    provider: 'metamask',
    strategy: 'web3_metamask_signature',
    name: 'MetaMask',
  },
  {
    provider: 'base',
    strategy: 'web3_base_signature',
    name: 'Base',
  },
  {
    provider: 'coinbase_wallet',
    strategy: 'web3_coinbase_wallet_signature',
    name: 'Coinbase Wallet',
  },
  {
    provider: 'okx_wallet',
    strategy: 'web3_okx_wallet_signature',
    name: 'OKX Wallet',
  },
  {
    provider: 'solana',
    strategy: 'web3_solana_signature',
    name: 'Solana',
  },
];
