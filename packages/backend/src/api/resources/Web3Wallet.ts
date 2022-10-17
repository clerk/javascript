import type { Web3WalletJSON } from './JSON';
import { Verification } from './Verification';

export class Web3Wallet {
  constructor(readonly id: string, readonly web3Wallet: string, readonly verification: Verification | null) {}

  static fromJSON(data: Web3WalletJSON): Web3Wallet {
    return new Web3Wallet(data.id, data.web3_wallet, data.verification && Verification.fromJSON(data.verification));
  }
}
