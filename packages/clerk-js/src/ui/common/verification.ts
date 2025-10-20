import type { ClerkAPIError } from '@clerk/shared/types';

import { getClerkAPIErrorMessage, getGlobalError } from '../utils/errorHandler';

export const VerificationErrorMessage = {
  Incorrect: 'Incorrect, try again',
  CodeExpired: 'The code has expired. Resend a new one.',
};

export function verificationErrorMessage(err: Error): string {
  const globalErr = getGlobalError(err);
  if (!globalErr) {
    return VerificationErrorMessage.Incorrect;
  }
  if (isVerificationExpiredError(globalErr)) {
    return VerificationErrorMessage.CodeExpired;
  }
  return getClerkAPIErrorMessage(globalErr);
}

export function isVerificationExpiredError(err: ClerkAPIError): boolean {
  return err.code === 'verification_expired';
}
