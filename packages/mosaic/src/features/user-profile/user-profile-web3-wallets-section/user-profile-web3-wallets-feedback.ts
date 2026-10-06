import type { MosaicMessages } from '../../../localization';
import { SaveError } from '../../../utils/errors';
import { Web3WalletActionError } from './user-profile-web3-wallets-section.types';

export function web3WalletFeedback(error: unknown, messages: MosaicMessages['userProfileWeb3Wallets']): unknown {
  if (error instanceof Web3WalletActionError) {
    return new SaveError({ global: { code: error.code, message: messages.errors[error.code] } });
  }
  return error;
}
