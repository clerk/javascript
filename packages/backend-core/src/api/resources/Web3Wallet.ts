import type { Nullable } from '../../util/nullable';
import associationDefaults from '../utils/Associations';
import { Association } from './Enums';
import type { Web3WalletJSON } from './JSON';
import type { Web3WalletProps } from './Props';
import { Verification } from './Verification';

interface Web3WalletAssociations {
  verification: Nullable<Verification>;
}

interface Web3WalletPayload extends Web3WalletProps, Web3WalletAssociations {}

export interface Web3Wallet extends Web3WalletPayload {}

export class Web3Wallet {
  static attributes = ['id', 'web3Wallet'];

  static associations = {
    verification: Association.HasOne,
  };

  static defaults = associationDefaults(Web3Wallet.associations);

  constructor(data: Partial<Web3WalletPayload> = {}) {
    Object.assign(this, Web3Wallet.defaults, data);
  }

  static fromJSON(data: Web3WalletJSON): Web3Wallet {
    return new Web3Wallet({
      id: data.id,
      web3Wallet: data.web3_wallet,
      verification: Verification.fromJSON(data.verification),
    });
  }
}
