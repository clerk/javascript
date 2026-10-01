import { isClerkAPIResponseError } from '@clerk/shared/error';

import type { MosaicMessages } from '../../../localization';
import { EnterpriseAccountActionError } from './user-profile-enterprise-accounts-section.types';

type Messages = MosaicMessages['userProfileEnterpriseAccountsSection'];

export function enterpriseAccountErrorMessage(error: unknown, messages: Messages): string {
  if (error instanceof EnterpriseAccountActionError) {
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
