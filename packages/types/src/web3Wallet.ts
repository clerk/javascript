import { ClerkResource } from './resource';
import { Web3Strategy } from './strategies';
import { VerificationResource } from './verification';

export type PrepareWeb3WalletVerificationParams = {
  strategy: Web3Strategy;
};

export interface Web3WalletResource extends ClerkResource {
  id: string;
  web3Wallet: string;
  verification: VerificationResource;
}

export interface AuthenticateWithWeb3Params {
  identifier: string;
  generateSignature: (opts: GenerateSignatureParams) => Promise<string>;
}

export interface GenerateSignatureParams {
  identifier: string;
  nonce: string;
}
