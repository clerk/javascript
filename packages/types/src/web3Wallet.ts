import { ClerkResource } from './resource';
import { VerificationResource } from './verification';

export interface Web3WalletResource extends ClerkResource {
  id: string;
  web3Wallet: string;
  verification: VerificationResource;
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
