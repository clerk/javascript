import { describe, expect, it, vi } from 'vitest';

import { clerkApiError } from '../../../../__tests__/clerk-errors';
import { toLocalizableError } from '../../../../utils/errors';
import { userProfileWeb3WalletsMessages } from '../../user-profile-web3-wallets.messages';
import { web3WalletFeedback } from '../user-profile-web3-wallets-feedback';
import { Web3WalletActionError } from '../user-profile-web3-wallets-section.types';

describe('Web3 wallet feedback', () => {
  it('preserves Clerk error codes for the shared localization boundary', () => {
    const cause = clerkApiError('verification_invalid_strategy', 'Server copy');
    const error = web3WalletFeedback(cause, userProfileWeb3WalletsMessages);

    expect(toLocalizableError(error)).toMatchObject({
      code: 'verification_invalid_strategy',
      message: 'Server copy',
    });
  });

  it.each([
    'providerUnavailable',
    'extensionUnavailable',
    'creationFailed',
    'messageUnavailable',
    'signatureUnavailable',
  ] as const)('preserves owned %s feedback through the shared boundary', code => {
    const error = web3WalletFeedback(new Web3WalletActionError(code), userProfileWeb3WalletsMessages);

    expect(toLocalizableError(error)).toEqual({ code, message: userProfileWeb3WalletsMessages.errors[code] });
  });

  it('keeps unexpected provider failures unlocalizable', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const cause = new Error('Private provider details');
    try {
      const error = web3WalletFeedback(cause, userProfileWeb3WalletsMessages);

      expect(toLocalizableError(error)).toEqual({ cause });
    } finally {
      log.mockRestore();
    }
  });
});
