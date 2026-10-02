import { isClerkAPIResponseError } from '@clerk/shared/error';

import type { LocalizableError, MosaicMessages } from '../../../localization';
import { ConnectedAccountActionError } from './user-profile-connected-accounts-section.types';

type Messages = MosaicMessages['userProfileConnectedAccounts'];

export function connectedAccountFeedback(
  error: unknown,
  messages: Messages,
  errorText: (error: LocalizableError) => string,
): Error {
  if (error instanceof ConnectedAccountActionError) {
    const message =
      error.code === 'missing_verification_url' ? messages.errors.missingVerificationUrl : messages.errors.unavailable;
    return new ConnectedAccountActionError(error.code, message, { cause: error });
  }
  let message: string = messages.errors.generic;
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    if (first) {
      message = errorText({
        code: first.code,
        paramName: first.meta?.paramName,
        message: first.longMessage || first.message,
      });
    }
  }
  return new Error(message, { cause: error });
}
