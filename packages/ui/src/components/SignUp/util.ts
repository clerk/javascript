import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import type { SignUpResource } from '@clerk/shared/types';

export { completeSignUpFlow } from '@clerk/shared/internal/clerk-js/completeSignUpFlow';

export function isSignUpPendingOAuthTransfer(signUp: SignUpResource): boolean {
  if (signUp.status !== 'missing_requirements') {
    return false;
  }
  if (signUp.protectCheck || signUp.missingFields.some(mf => mf === 'protect_check')) {
    return false;
  }
  const externalAccount = signUp.verifications?.externalAccount;
  return (
    externalAccount?.status === 'transferable' && externalAccount.error?.code === ERROR_CODES.EXTERNAL_ACCOUNT_EXISTS
  );
}
