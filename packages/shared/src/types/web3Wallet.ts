import type { ClerkResource } from './resource';
import type { Web3WalletJSONSnapshot } from './snapshots';
import type { Web3Strategy } from './strategies';
import type { VerificationResource } from './verification';
import type { EthereumWeb3Provider, SolanaWeb3Provider } from './web3';

export type PrepareWeb3WalletVerificationParams = {
  strategy: Web3Strategy;
};

export type AttemptWeb3WalletVerificationParams = {
  signature: string;
  strategy?: Web3Strategy;
};

export interface Web3WalletResource extends ClerkResource {
  id: string;
  web3Wallet: string;
  verification: VerificationResource;
  toString: () => string;
  prepareVerification: (params: PrepareWeb3WalletVerificationParams) => Promise<Web3WalletResource>;
  attemptVerification: (params: AttemptWeb3WalletVerificationParams) => Promise<Web3WalletResource>;
  destroy: () => Promise<void>;
  create: () => Promise<Web3WalletResource>;
  __internal_toSnapshot: () => Web3WalletJSONSnapshot;
}

export type GenerateSignature = (
  opts: GenerateEthereumSignatureParams | GenerateSolanaSignatureParams,
) => Promise<string>;

export interface AuthenticateWithWeb3Params {
  identifier: string;
  generateSignature: GenerateSignature;
  strategy?: Web3Strategy;
  walletName?: string;
}

export interface GenerateEthereumSignatureParams {
  identifier: string;
  nonce: string;
  provider: EthereumWeb3Provider;
  walletName?: string;
}

export interface GenerateSolanaSignatureParams {
  identifier: string;
  nonce: string;
  provider: SolanaWeb3Provider;
  walletName: string;
}
