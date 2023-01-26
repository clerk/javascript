import type { ClerkResource } from './resource';
import type { Web3Strategy } from './strategies';
import type { VerificationResource } from './verification';

export type PrepareWeb3WalletVerificationParams = {
  strategy: Web3Strategy;
};

export type AttemptWeb3WalletVerificationParams = {
  signature?: string;
  /** @deprecated Use signature field instead */
  generateSignature?: GenerateSignature;
};

export interface Web3WalletResource extends ClerkResource {
  id: string;
  web3Wallet: string;
  verification: VerificationResource;
  toString: () => string;
  prepareVerification: (params: PrepareWeb3WalletVerificationParams) => Promise<Web3WalletResource>;
  attemptVerification: (params: AttemptWeb3WalletVerificationParams) => Promise<Web3WalletResource>;
  destroy: () => Promise<void>;
}

export type GenerateSignature = (opts: GenerateSignatureParams) => Promise<string>;

export interface AuthenticateWithWeb3Params {
  identifier: string;
  generateSignature: GenerateSignature;
}

export interface GenerateSignatureParams {
  identifier: string;
  nonce: string;
}
