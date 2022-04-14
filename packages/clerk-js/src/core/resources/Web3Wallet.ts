import type { VerificationResource, Web3WalletJSON, Web3WalletResource } from '@clerk/types';

import { BaseResource, Verification } from './internal';

export class Web3Wallet extends BaseResource implements Web3WalletResource {
  id!: string;
  web3Wallet = '';
  verification!: VerificationResource;

  public constructor(data: Web3WalletJSON, pathRoot: string) {
    super();
    this.pathRoot = pathRoot;
    this.fromJSON(data);
  }

  toString(): string {
    return this.web3Wallet;
  }

  protected fromJSON(data: Web3WalletJSON): this {
    this.id = data.id;
    this.web3Wallet = data.web3_wallet;
    this.verification = new Verification(data.verification);
    return this;
  }
}
