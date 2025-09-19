import { ClerkAPIResponseError } from '@clerk/shared/error';
import { describe, expect, it } from 'vitest';

import { isVerificationExpiredError, VerificationErrorMessage, verificationErrorMessage } from '../verification';

describe('verification utils', () => {
  describe('verificationErrorMessage', () => {
    it('returns expired error message', () => {
      expect(
        verificationErrorMessage(
          new ClerkAPIResponseError('message', {
            data: [{ code: 'verification_expired', message: 'message' }],
            status: 400,
          }),
        ),
      ).toEqual(VerificationErrorMessage.CodeExpired);
    });

    it('returns clerk API error message', () => {
      const message = 'The message';
      const longMessage = 'The longest message';
      expect(
        verificationErrorMessage(
          new ClerkAPIResponseError(message, {
            data: [{ code: 'whatever', long_message: longMessage, message }],
            status: 400,
          }),
        ),
      ).toEqual(longMessage);

      expect(
        verificationErrorMessage(
          new ClerkAPIResponseError(message, {
            data: [{ code: 'whatever', message }],
            status: 400,
          }),
        ),
      ).toEqual(message);
    });

    it('falls back to default error message', () => {
      expect(verificationErrorMessage(new Error('the error'))).toEqual(VerificationErrorMessage.Incorrect);
    });
  });

  describe('isVerificationExpiredError', () => {
    it('returns true for expired code', () => {
      const message = 'the message';
      expect(
        isVerificationExpiredError(
          new ClerkAPIResponseError(message, {
            data: [{ code: 'verification_expired', message }],
            status: 400,
          }).errors[0],
        ),
      ).toEqual(true);
      expect(
        isVerificationExpiredError(
          new ClerkAPIResponseError(message, {
            data: [{ code: 'whatever', message }],
            status: 400,
          }).errors[0],
        ),
      ).toEqual(false);
    });
  });
});
