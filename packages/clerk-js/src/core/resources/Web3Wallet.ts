import type {
  AttemptWeb3WalletVerificationParams,
  PrepareWeb3WalletVerificationParams,
  VerificationResource,
  Web3WalletJSON,
  Web3WalletJSONSnapshot,
  Web3WalletResource,
} from '@clerk/shared/types';

import { BaseResource, Verification } from './internal';

export class Web3Wallet extends BaseResource implements Web3WalletResource {
  id!: string;
  web3Wallet = '';
  verification!: VerificationResource;

  public constructor(data: Partial<Web3WalletJSON | Web3WalletJSONSnapshot>, pathRoot: string);
  public constructor(data: Web3WalletJSON | Web3WalletJSONSnapshot, pathRoot: string) {
    super();
    this.pathRoot = pathRoot;
    this.fromJSON(data);
  }

  create(): Promise<this> {
    return this._basePost({
      body: { web3_wallet: this.web3Wallet },
    });
  }

  prepareVerification = (params: PrepareWeb3WalletVerificationParams): Promise<this> => {
    return this._basePost<Web3WalletJSON>({
      action: 'prepare_verification',
      body: { ...params },
    });
  };

  attemptVerification = (params: AttemptWeb3WalletVerificationParams): Promise<this> => {
    const { signature } = params;
    return this._basePost<Web3WalletJSON>({
      action: 'attempt_verification',
      body: { signature },
    });
  };

  destroy(): Promise<void> {
    return this._baseDelete();
  }

  toString(): string {
    return this.web3Wallet;
  }

  protected fromJSON(data: Web3WalletJSON | Web3WalletJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.web3Wallet = data.web3_wallet;
    this.verification = new Verification(data.verification);
    return this;
  }

  public __internal_toSnapshot(): Web3WalletJSONSnapshot {
    return {
      object: 'web3_wallet',
      id: this.id,
      web3_wallet: this.web3Wallet,
      verification: this.verification.__internal_toSnapshot(),
    };
  }
}
