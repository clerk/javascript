import { isClerkAPIResponseError } from '@clerk/shared/error';

import type { MosaicMessages } from '../../../localization';
import { ConnectedAccountActionError } from './user-profile-connected-accounts-section.model';

type Messages = MosaicMessages['userProfileConnectedAccounts'];

export function connectedAccountErrorMessage(error: unknown, messages: Messages): string {
  if (error instanceof ConnectedAccountActionError) {
    return error.code === 'missing_verification_url'
      ? messages.errors.missingVerificationUrl
      : messages.errors.unavailable;
  }
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    return first?.longMessage || first?.message || messages.errors.generic;
  }
  return messages.errors.generic;
}
