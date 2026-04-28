import type { Web3Strategy } from './strategies';

export interface Web3ProviderData {
  provider: Web3Provider;
  strategy: Web3Strategy;
  name: string;
}

/** @inline */
export type MetamaskWeb3Provider = 'metamask';
/** @inline */
export type CoinbaseWalletWeb3Provider = 'coinbase_wallet';
/** @inline */
export type OKXWalletWeb3Provider = 'okx_wallet';
/** @inline */
export type BaseWeb3Provider = 'base';
/** @inline */
export type SolanaWeb3Provider = 'solana';

/** @inline */
export type Web3Provider = EthereumWeb3Provider | SolanaWeb3Provider;

/** @inline */
export type EthereumWeb3Provider =
  | MetamaskWeb3Provider
  | BaseWeb3Provider
  | CoinbaseWalletWeb3Provider
  | OKXWalletWeb3Provider;
