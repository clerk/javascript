import type { Web3ProviderData } from '@clerk/types';

export const WEB3_PROVIDERS: Web3ProviderData[] = [
  {
    provider: 'metamask',
    strategy: 'web3_metamask_signature',
    name: 'MetaMask',
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
];
