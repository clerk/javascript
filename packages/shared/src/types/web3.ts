import type { Web3Strategy } from './strategies';

export interface Web3ProviderData {
  provider: Web3Provider;
  strategy: Web3Strategy;
  name: string;
}

export type MetamaskWeb3Provider = 'metamask';
export type CoinbaseWalletWeb3Provider = 'coinbase_wallet';
export type OKXWalletWeb3Provider = 'okx_wallet';
export type BaseWeb3Provider = 'base';
export type SolanaWeb3Provider = 'solana';

export type Web3Provider =
  | MetamaskWeb3Provider
  | BaseWeb3Provider
  | CoinbaseWalletWeb3Provider
  | OKXWalletWeb3Provider
  | SolanaWeb3Provider;

export type EthereumWeb3Provider =
  | MetamaskWeb3Provider
  | BaseWeb3Provider
  | CoinbaseWalletWeb3Provider
  | OKXWalletWeb3Provider;
