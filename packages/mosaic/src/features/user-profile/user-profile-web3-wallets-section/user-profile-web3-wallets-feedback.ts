import { isClerkAPIResponseError } from '@clerk/shared/error';

import type { LocalizableError, MosaicMessages } from '../../../localization';
import { toLocalizableApiError } from '../../../localization';
import { Web3WalletActionError } from './user-profile-web3-wallets-section.types';

export function web3WalletFeedback(
  error: unknown,
  messages: MosaicMessages['userProfileWeb3Wallets'],
  errorText: (error: LocalizableError) => string,
): Error {
  if (error instanceof Web3WalletActionError) {
    return new Web3WalletActionError(error.code, messages.errors[error.code], { cause: error });
  }
  let message: string = messages.errors.generic;
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    if (first) {
      message = errorText(toLocalizableApiError(first, messages.errors.generic));
    }
  }
  return new Error(message, { cause: error });
}
