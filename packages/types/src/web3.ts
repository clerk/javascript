import type { Web3Strategy } from './strategies';

export interface Web3ProviderData {
  provider: Web3Provider;
  strategy: Web3Strategy;
  name: string;
}

export type MetamaskWeb3Provider = 'metamask';
export type CoinbaseWalletWeb3Provider = 'coinbase_wallet';
export type OKXWalletWeb3Provider = 'okx_wallet';

export type Web3Provider = MetamaskWeb3Provider | CoinbaseWalletWeb3Provider | OKXWalletWeb3Provider;

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

interface getWeb3ProviderDataProps {
  provider?: Web3Provider;
  strategy?: Web3Strategy;
}

export function getWeb3ProviderData({
  provider,
  strategy,
}: getWeb3ProviderDataProps): Web3ProviderData | undefined | null {
  if (provider) {
    return WEB3_PROVIDERS.find(p => p.provider == provider);
  }

  return WEB3_PROVIDERS.find(p => p.strategy == strategy);
}
