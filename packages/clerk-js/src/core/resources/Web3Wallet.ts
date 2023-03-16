import type {
  AttemptWeb3WalletVerificationParams,
  PrepareWeb3WalletVerificationParams,
  VerificationResource,
  Web3WalletJSON,
  Web3WalletResource,
} from '@clerk/types';

import { clerkMissingOptionError, clerkVerifyWeb3WalletCalledBeforeCreate } from '../../core/errors';
import { BaseResource, Verification } from './internal';

export class Web3Wallet extends BaseResource implements Web3WalletResource {
  id!: string;
  web3Wallet = '';
  verification!: VerificationResource;

  public constructor(data: Partial<Web3WalletJSON>, pathRoot: string);
  public constructor(data: Web3WalletJSON, pathRoot: string) {
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
    const { signature, generateSignature } = params || {};

    if (signature) {
      return this._basePost<Web3WalletJSON>({
        action: 'attempt_verification',
        body: { signature },
      });
    }

    if (!(typeof generateSignature === 'function')) {
      clerkMissingOptionError('generateSignature');
    }

    const generateSignatureForNonce = async (): Promise<this> => {
      if (!(typeof generateSignature === 'function')) {
        clerkMissingOptionError('generateSignature');
      }

      const { nonce } = this.verification;
      if (!nonce) {
        clerkVerifyWeb3WalletCalledBeforeCreate('SignUp');
      }

      const generatedSignature = await generateSignature({ identifier: this.web3Wallet, nonce });
      return this._basePost<Web3WalletJSON>({
        action: 'attempt_verification',
        body: { signature: generatedSignature },
      });
    };

    return generateSignatureForNonce();
  };

  destroy(): Promise<void> {
    return this._baseDelete();
  }

  toString(): string {
    return this.web3Wallet;
  }

  protected fromJSON(data: Web3WalletJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.web3Wallet = data.web3_wallet;
    this.verification = new Verification(data.verification);
    return this;
  }
}
